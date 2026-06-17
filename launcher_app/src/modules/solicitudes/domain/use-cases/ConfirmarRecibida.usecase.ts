import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";

export interface ConfirmarRecibidaInput {
  solicitudId: string;
  actorId: string;
  rol: "solicitante" | "admin";
}

export class ConfirmarRecibidaUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notifier: ForNotifying,
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
      throw new Error(`Solicitud con ID ${solicitudId} no encontrada.`);
    }

    // Verificar permisos: si es solicitante, debe ser el dueño de la solicitud
    if (rol === "solicitante" && solicitud.id_usuario !== actorId) {
      throw new Error("No tenés permiso para confirmar la recepción de esta solicitud.");
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
      await this.notifier.notificar({
        destinatario: solicitud.id_base,
        solicitudId,
        estado: solicitud.estado,
      });
    }
  }
}
