import { ForNotifying } from "../ports/forNotifying.port";

export class NotificarRecepcion {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(solicitudId: string, remitenteId: string): Promise<void> {
    await this.notifier.notificar({
      destinatario: remitenteId,
      solicitudId,
      estado: "completada",
    });
  }
}
