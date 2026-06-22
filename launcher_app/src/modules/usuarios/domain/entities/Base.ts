export class Base {
  constructor(
    public readonly nombre: string,
    public readonly posicionBase: string,
    public readonly direccion: string,
    public readonly id?: string,
  ) {}
}
