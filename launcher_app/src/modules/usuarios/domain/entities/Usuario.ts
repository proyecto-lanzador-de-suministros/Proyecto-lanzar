export type EstadoCuenta = "PENDIENTE" | "APROBADA" | "RECHAZADA";
export type RolUsuario = "SOLICITANTE" | "REMITENTE" | "ADMINISTRADOR";

export class Usuario {
  constructor(
    public readonly id: string,
    public estadoCuenta: EstadoCuenta,
    public readonly rol: RolUsuario,
    public readonly nombre?: string
  ) {}

  aprobar() {
    this.estadoCuenta = "APROBADA";
  }

  rechazar() {
    this.estadoCuenta = "RECHAZADA";
  }
}