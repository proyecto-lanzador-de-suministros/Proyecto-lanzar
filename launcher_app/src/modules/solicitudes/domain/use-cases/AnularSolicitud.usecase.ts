import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { NotificarAnulacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarAnulacion.usecase";

export class AnularSolicitudUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notificarAnulacion: NotificarAnulacion,
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
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    const estadoAnterior = solicitud.estado;

    // La entidad valida que la transición sea legal (lanza si ya está Completada/Cancelada/Anulada)
    solicitud.anular(motivo);

    // Persistir el nuevo estado
    await this.solicitudRepository.actualizar(solicitud);

    // Registrar en el historial de auditoría (CU-11, paso 5)
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
      motivo,
    });

    // Notificar al solicitante (CU-11, postcondición 3)
    await this.notificarAnulacion.ejecutar(solicitudId, solicitud.id_usuario);
  }
}