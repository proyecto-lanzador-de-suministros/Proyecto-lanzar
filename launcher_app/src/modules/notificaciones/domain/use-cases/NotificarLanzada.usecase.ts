import { ForNotifying } from "../ports/forNotifying.port";

export class NotificarLanzada {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(solicitudId: string, solicitanteId: string): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: "lanzada",
    });
  }
}
