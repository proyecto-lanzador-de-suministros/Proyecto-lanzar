// Caso de uso. Autentica un usuario con credenciales e inicia una sesión.
import { ForAuthenticating } from "../ports/forAuthenticating.port";

export class IniciarSesion {
  constructor(private readonly auth: ForAuthenticating) {}

  async ejecutar(req: Request): Promise<string> {
    const usuario = await this.auth.obtenerUsuarioActual(req);
    if (!usuario) throw new Error("No autenticado");
    if (!usuario.rol) return "/completar-registro";
    const rutas: Record<string, string> = {
      admin: "/admin/dashboard",
      remitente: "/remitente/dashboard",
      solicitante: "/solicitante/dashboard",
    };
    return rutas[usuario.rol];
  }
}
