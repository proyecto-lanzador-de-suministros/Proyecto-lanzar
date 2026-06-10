import { ForNotifying } from "../ports/forNotifying.port";

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
      estado: "asignada",
    });
    await this.notifier.notificar({
      destinatario: remitenteId,
      solicitudId,
      estado: "asignada",
    });
  }
}
