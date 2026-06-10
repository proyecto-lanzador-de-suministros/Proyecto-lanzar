// Caso de uso. Finaliza la sesión activa del usuario autenticado.
// Clerk maneja el cierre de sesión del lado del cliente
// con el componente <SignOutButton /> o clerk.signOut()
// Este caso de uso existe por si se necesita lógica adicional al cerrar sesión

import { ForAuthenticating } from "../ports/forAuthenticating.port";

export class CerrarSesion {
  constructor(private readonly auth: ForAuthenticating) {}

  async ejecutar(): Promise<void> {
    await this.auth.cerrarSesion();
  }
}
