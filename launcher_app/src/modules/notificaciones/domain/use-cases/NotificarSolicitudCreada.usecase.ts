import { ForNotifying } from "../ports/forNotifying.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export class NotificarSolicitudCreada {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(solicitudId: string, solicitanteId: string): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: EstadoSolicitud.Creada,
    });
  }
}
