export class Stock {
  constructor(
    readonly id: string,
    readonly baseId: string,
    readonly productoId: string,
    private _cantidadDisponible: number,
    private _cantidadReservada: number,
  ) {}

  get disponible(): number { return this._cantidadDisponible }
  get reservado(): number { return this._cantidadReservada }

  reservar(cantidad: number): void {
    if (cantidad <= 0) throw new Error("Cantidad inválida")
    if (cantidad > this._cantidadDisponible) {
      throw new Error("STOCK_INSUFICIENTE")
    }
    this._cantidadDisponible -= cantidad
    this._cantidadReservada += cantidad
  }

  liberar(cantidad: number): void {
    if (cantidad <= 0) throw new Error("Cantidad inválida")
    this._cantidadReservada -= cantidad
    this._cantidadDisponible += cantidad
  }

  reponer(cantidad: number): void {
    if (cantidad <= 0) throw new Error("Cantidad inválida")
    this._cantidadDisponible += cantidad
  }

  static crear(props: {
    baseId: string;
    productoId: string;
    cantidadDisponible: number;
  }): Stock {
    return new Stock(
      crypto.randomUUID(),
      props.baseId,
      props.productoId,
      props.cantidadDisponible,
      0,
    )
  }

  static reconstruir(props: {
    id: string;
    baseId: string;
    productoId: string;
    cantidadDisponible: number;
    cantidadReservada: number;
  }): Stock {
    return new Stock(
      props.id, props.baseId, props.productoId,
      props.cantidadDisponible, props.cantidadReservada,
    )
  }
}
