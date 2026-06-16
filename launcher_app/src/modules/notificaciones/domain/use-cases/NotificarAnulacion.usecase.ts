import { ForNotifying } from "../ports/forNotifying.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export class NotificarAnulacion {
  constructor(private readonly notifier: ForNotifying) {}

  /**
   * Notifica al solicitante cuando una solicitud es anulada por el admin o remitente (CU-11).
   */
  async ejecutar(solicitudId: string, solicitanteId: string): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: EstadoSolicitud.Anulada,
    });
  }
}