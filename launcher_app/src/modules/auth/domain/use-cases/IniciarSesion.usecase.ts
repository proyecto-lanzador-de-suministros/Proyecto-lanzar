// Caso de uso. Autentica un usuario con credenciales e inicia una sesión.
import { ForAuthenticating } from "../ports/forAuthenticating.port";

export class IniciarSesion {
  constructor(private readonly auth: ForAuthenticating) {}

  async ejecutar(req: Request) {
    const usuario = await this.auth.obtenerUsuarioActual(req);
    if (!usuario) throw new Error("No autenticado");
    return usuario;
  }
}
