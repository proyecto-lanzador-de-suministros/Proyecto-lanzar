import { auth } from "@clerk/nextjs/server";
import {
  ForAuthenticating,
  UsuarioAutenticado,
} from "../../domain/ports/forAuthenticating.port";

export class ClerkAuthAdapter implements ForAuthenticating {
  async obtenerUsuarioActual(
    _req: Request,
  ): Promise<UsuarioAutenticado | null> {
    const { userId, sessionClaims } = await auth();
    if (!userId) return null;

    const rol = sessionClaims?.metadata?.rol as UsuarioAutenticado["rol"];
    if (!rol) return null;

    return {
      id: userId,
      email: sessionClaims?.email as string,
      rol,
    };
  }

  async cerrarSesion(): Promise<void> {
    // Clerk maneja el cierre de sesión desde el cliente
    // con <SignOutButton /> o clerk.signOut()
  }
}
