export type RolSesion = "admin" | "remitente" | "solicitante"

export class Sesion {
  constructor(
    readonly usuarioId: string,
    readonly email: string,
    readonly rol: RolSesion,
    readonly autenticado: boolean,
  ) {}

  static noAutenticada(): Sesion {
    return new Sesion("", "", "solicitante", false)
  }

  get dashboardRoute(): string {
    switch (this.rol) {
      case "admin": return "/admin"
      case "remitente": return "/remitente"
      case "solicitante": return "/solicitante"
    }
  }

  esValida(): boolean {
    return this.autenticado && !!this.usuarioId
  }

  tieneRol(...roles: RolSesion[]): boolean {
    return roles.includes(this.rol)
  }
}
