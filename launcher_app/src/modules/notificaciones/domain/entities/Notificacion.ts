export type TipoNotificacion = "solicitud" | "cuenta"

export class Notificacion {
  private constructor(
    readonly id: string,
    readonly mensaje: string,
    readonly fechaHora: Date,
    readonly destinatarioId: string,
    readonly solicitudId: string | null,
    readonly tipo: TipoNotificacion,
    private _leida: boolean,
  ) {}

  static crear(props: {
    mensaje: string;
    destinatarioId: string;
    solicitudId?: string;
    tipo: TipoNotificacion;
  }): Notificacion {
    if (!props.mensaje?.trim()) throw new Error("Mensaje requerido")
    if (!props.destinatarioId?.trim()) throw new Error("Destinatario requerido")
    return new Notificacion(
      crypto.randomUUID(),
      props.mensaje.trim(),
      new Date(),
      props.destinatarioId,
      props.solicitudId ?? null,
      props.tipo,
      false,
    )
  }

  static reconstruir(props: {
    id: string; mensaje: string; fechaHora: Date;
    destinatarioId: string; solicitudId: string | null;
    tipo: TipoNotificacion; leida: boolean;
  }): Notificacion {
    return new Notificacion(
      props.id, props.mensaje, props.fechaHora,
      props.destinatarioId, props.solicitudId, props.tipo, props.leida,
    )
  }

  marcarComoLeida(): void {
    this._leida = true
  }

  get leida(): boolean { return this._leida }
}
