import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ForNotifying } from "../ports/forNotifying.port";

export class NotificarLista {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(solicitudId: string, solicitanteId: string): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: EstadoSolicitud.Lista,
    });
  }
}
