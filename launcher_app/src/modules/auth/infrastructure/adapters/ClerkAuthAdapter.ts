import { currentUser } from "@clerk/nextjs/server";
import {
  ForAuthenticating,
  UsuarioAutenticado,
} from "../../domain/ports/forAuthenticating.port";

export class ClerkAuthAdapter implements ForAuthenticating {
  async obtenerUsuarioActual(
    _req: Request,
  ): Promise<UsuarioAutenticado | null> {
    const user = await currentUser();
    if (!user) return null;

    const rol = user.publicMetadata?.rol as UsuarioAutenticado["rol"];
    if (!rol) return null;

    return {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      rol,
    };
  }
}
