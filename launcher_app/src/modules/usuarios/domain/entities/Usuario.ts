export type EstadoCuenta = "PENDIENTE" | "APROBADA" | "RECHAZADA";
export type RolUsuario = "SOLICITANTE" | "REMITENTE" | "ADMINISTRADOR";

export class Usuario {
  constructor(
    public readonly id: string,
    public estadoCuenta: EstadoCuenta,
    public readonly rol: RolUsuario,
    public readonly nombre?: string,
    public readonly email?: string,
    public readonly telefono?: string,
    public readonly idBase?: string,
  ) {}

  static estadoInicial(rol: RolUsuario, esAdmin: boolean): EstadoCuenta {
    if (esAdmin) return "APROBADA";
    if (rol === "REMITENTE") return "PENDIENTE";
    return "APROBADA";
  }

  aprobar() {
    this.estadoCuenta = "APROBADA";
  }

  rechazar() {
    this.estadoCuenta = "RECHAZADA";
  }
}