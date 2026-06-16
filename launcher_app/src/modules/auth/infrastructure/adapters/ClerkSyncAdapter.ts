import { clerkClient } from "@clerk/nextjs/server";
import { ForSyncingExternalAuth } from "../../domain/ports/forSyncingExternalAuth.port";

/**
 * Adaptador driven. Implementa ForSyncingExternalAuth usando el SDK
 * server-side de Clerk (@clerk/nextjs/server).
 *
 * Solo este adaptador conoce que el IdP externo es Clerk.
 * El dominio solo conoce el puerto ForSyncingExternalAuth.
 */
export class ClerkSyncAdapter implements ForSyncingExternalAuth {
  async actualizarMetadatos(
    usuarioId: string,
    metadatos: Record<string, unknown>,
  ): Promise<void> {
    const client = await clerkClient();

    // Leer los metadatos actuales para hacer un merge y no pisar campos existentes
    // (ej. el campo "rol" que se setea al registrarse)
    const user = await client.users.getUser(usuarioId);
    const metadatosActuales = (user.publicMetadata as Record<string, unknown>) ?? {};

    await client.users.updateUserMetadata(usuarioId, {
      publicMetadata: {
        ...metadatosActuales,
        ...metadatos,
      },
    });
  }
}