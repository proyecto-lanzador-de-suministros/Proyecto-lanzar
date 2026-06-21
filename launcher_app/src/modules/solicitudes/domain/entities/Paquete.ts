export class Paquete {
  constructor(
    readonly id: string,
    readonly solicitudId: string,
    readonly tipoParacaidas: string | null,
    readonly pesoMaximo: number | null,
    readonly estadoMecanico: string | null,
  ) {}

  get estaOperativo(): boolean {
    return this.estadoMecanico !== "averiado"
  }

  static crear(props: {
    solicitudId: string;
    tipoParacaidas?: string;
    pesoMaximo?: number;
    estadoMecanico?: string;
  }): Paquete {
    return new Paquete(
      crypto.randomUUID(),
      props.solicitudId,
      props.tipoParacaidas ?? null,
      props.pesoMaximo ?? null,
      props.estadoMecanico ?? "nuevo",
    )
  }
}
