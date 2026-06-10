// Caso de uso. Notifica a solicitante y remitente cuando una solicitud cambia de estado.
import { ForNotifying } from "../ports/forNotifying.port";

export class NotificarEnPreparacion {
  constructor(private readonly notifier: ForNotifying) {}

  async ejecutar(solicitudId: string, solicitanteId: string): Promise<void> {
    await this.notifier.notificar({
      destinatario: solicitanteId,
      solicitudId,
      estado: "en_preparacion",
    });
  }
}
