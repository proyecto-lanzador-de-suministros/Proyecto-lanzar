import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ForNotifying } from "../ports/forNotifying.port";

export class NotificarCancelacion {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(solicitudId: string, solicitanteId: string, remitenteIds?: string[]): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: EstadoSolicitud.Cancelada,
    });

    if (!remitenteIds || remitenteIds.length === 0) return;

    await Promise.all(
      remitenteIds.map(remitenteId =>
        this.notifier.notificar({
          destinatario: remitenteId,
          solicitudId,
          estado: EstadoSolicitud.Cancelada,
        }),
      ),
    );
  }
}