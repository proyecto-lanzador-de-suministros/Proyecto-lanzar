import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";
import { NotificarLista } from "@/src/modules/notificaciones/domain/use-cases/NotificarLista.usecase";

export interface RegistrarListaInput {
  solicitudId: string;
  actorId: string;
  rol: "remitente" | "admin";
}

export class RegistrarListaUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notificarLista: NotificarLista,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Marca la solicitud como lista para el envío (CU-13).
   * Solo el remitente asignado o un admin pueden ejecutar esto.
   *
   * @param input Datos necesarios para el registro.
   */
  async ejecutar(input: RegistrarListaInput): Promise<void> {
    const { solicitudId, actorId, rol } = input;
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    // Verificar permisos: si es remitente, debe ser el asignado a la solicitud
    if (rol === "remitente" && solicitud.id_remitente !== actorId) {
      throw Errores.permisoDenegado("remitente", rol);
    }

    const estadoAnterior = solicitud.estado;

    // La entidad valida la transición (En preparación -> Lista)
    solicitud.avanzarEstado(EstadoSolicitud.Lista);

    // Persistir el cambio
    await this.solicitudRepository.actualizarEstado(solicitudId, solicitud.estado);

    // Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // Notificar al solicitante (CU-13, postcondición)
    await this.notificarLista.ejecutar(solicitudId, solicitud.id_usuario);
  }
}
