import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";
import { NotificarEnPreparacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarEnPreparacion.usecase";

export interface RegistrarEnPreparacionInput {
  solicitudId: string;
  actorId: string;
  rol: "remitente" | "admin";
}

export class RegistrarEnPreparacionUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notificarEnPreparacion: NotificarEnPreparacion,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Indica que la solicitud ha comenzado a ser preparada físicamente (CU-12).
   * Solo el remitente asignado o un admin pueden ejecutar esto.
   *
   * @param input Datos necesarios para el registro.
   */
  async ejecutar(input: RegistrarEnPreparacionInput): Promise<void> {
    const { solicitudId, actorId, rol } = input;
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    // Verificar permisos: si es remitente, debe ser el asignado a la solicitud
    if (rol === "remitente" && solicitud.id_base !== actorId) {
      throw Errores.permisoDenegado("remitente", rol);
    }

    const estadoAnterior = solicitud.estado;

    // La entidad valida la transición (Asignada -> En preparación)
    solicitud.avanzarEstado(EstadoSolicitud.EnPreparacion);

    // Persistir el cambio
    await this.solicitudRepository.actualizarEstado(solicitudId, solicitud.estado);

    // Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // Notificar al solicitante (CU-12, postcondición)
    await this.notificarEnPreparacion.ejecutar(solicitudId, solicitud.id_usuario);
  }
}
