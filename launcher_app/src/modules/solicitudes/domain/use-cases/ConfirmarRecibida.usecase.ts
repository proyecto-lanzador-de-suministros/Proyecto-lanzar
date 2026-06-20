import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";
import { NotificarRecepcion } from "@/src/modules/notificaciones/domain/use-cases/NotificarRecepcion.usecase";

export interface ConfirmarRecibidaInput {
  solicitudId: string;
  actorId: string;
  rol: "solicitante" | "admin";
}

export class ConfirmarRecibidaUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notificarRecepcion: NotificarRecepcion,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Confirma que el paquete fue recibido correctamente (CU-16).
   * Solo el solicitante dueño de la solicitud o un admin pueden ejecutar esto.
   *
   * @param input Datos necesarios para el registro.
   */
  async ejecutar(input: ConfirmarRecibidaInput): Promise<void> {
    const { solicitudId, actorId, rol } = input;
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    // Verificar permisos: si es solicitante, debe ser el dueño de la solicitud
    if (rol === "solicitante" && solicitud.id_usuario !== actorId) {
      throw Errores.permisoDenegado("solicitante", rol);
    }

    const estadoAnterior = solicitud.estado;

    // La entidad valida la transición (Lanzada -> Completada) y registra fecha de entrega
    solicitud.confirmarEntrega();

    // Persistir el cambio
    await this.solicitudRepository.actualizarEstado(solicitudId, solicitud.estado);

    // Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // Notificar al remitente (CU-16, postcondición)
    if (solicitud.id_base) {
      await this.notificarRecepcion.ejecutar(solicitudId, solicitud.id_base);
    }
  }
}
