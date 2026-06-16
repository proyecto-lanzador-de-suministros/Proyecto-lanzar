import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

export class AnularSolicitudUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notifier: ForNotifying,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Anula una solicitud (CU-11). Solo admin o remitente pueden ejecutar esto.
   * Registra el cambio en el historial y notifica al solicitante.
   *
   * @param solicitudId  UUID de la solicitud a anular.
   * @param motivo       Razón de la anulación (para auditoría).
   * @param actorId      ID del usuario que ejecuta la anulación (para el historial).
   */
  async ejecutar(solicitudId: string, motivo: string, actorId: string): Promise<void> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw new Error(`Solicitud con ID ${solicitudId} no encontrada.`);
    }

    const estadoAnterior = solicitud.estado;

    // La entidad valida que la transición sea legal (lanza si ya está Completada/Cancelada/Anulada)
    solicitud.anular(motivo);

    // Persistir el nuevo estado
    await this.solicitudRepository.guardar(solicitud);

    // Registrar en el historial de auditoría (CU-11, paso 5)
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
      motivo,
    });

    // Notificar al solicitante (CU-11, postcondición 3)
    await this.notifier.notificar({
      destinatario: solicitud.solicitanteId,
      solicitudId,
      estado: solicitud.estado,
    });
  }
}