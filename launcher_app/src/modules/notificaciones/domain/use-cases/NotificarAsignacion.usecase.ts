import { ForNotifying } from "../ports/forNotifying.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export class NotificarAsignacion {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(
    solicitudId: string,
    solicitanteId: string,
    remitenteId: string,
  ): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: EstadoSolicitud.Asignada,
    });
    await this.notifier.notificar({
      destinatario: remitenteId,
      solicitudId,
      estado: EstadoSolicitud.Asignada,
    });
  }
}