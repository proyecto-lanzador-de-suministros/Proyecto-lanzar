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

  /**
   * Crea un usuario nuevo directamente en Clerk (alta administrativa).
   * Setea el rol en publicMetadata desde el momento de creación, así
   * el primer login ya trae el JWT con sessionClaims.metadata.rol
   * correctamente poblado (consistente con ClerkAuthAdapter).
   *
   * Clerk exige password con un mínimo de complejidad; si falla la
   * validación, el error sube tal cual lo devuelve el SDK para que
   * el caller lo traduzca a un mensaje de usuario.
   */
  async crearUsuarioExterno(datos: {
    email: string;
    password: string;
    nombre?: string;
    rol: "admin" | "remitente" | "solicitante";
  }): Promise<{ id: string }> {
    const client = await clerkClient();

    const [firstName, ...resto] = (datos.nombre ?? "").trim().split(" ").filter(Boolean);
    const lastName = resto.join(" ") || undefined;

    const usuarioCreado = await client.users.createUser({
      emailAddress: [datos.email],
      password: datos.password,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      publicMetadata: {
        rol: datos.rol,
      },
      skipPasswordChecks: false,
    });

    return { id: usuarioCreado.id };
  }

  async actualizarNombreUsuario(
    usuarioId: string,
    nuevoUsername: string,
  ): Promise<void> {
    const client = await clerkClient();
    await client.users.updateUser(usuarioId, {
      username: nuevoUsername,
    });
  }

  async actualizarContrasena(
    usuarioId: string,
    nuevaPassword: string,
  ): Promise<void> {
    const client = await clerkClient();
    await client.users.updateUser(usuarioId, {
      password: nuevaPassword,
    });
  }

  async actualizarEmail(
    usuarioId: string,
    nuevoEmail: string,
  ): Promise<void> {
    const client = await clerkClient();

    const emailAddress = await client.emailAddresses.createEmailAddress({
      userId: usuarioId,
      email: nuevoEmail,
      primary: true,
      verified: true,
    });

    const user = await client.users.getUser(usuarioId);
    const idsAEliminar = user.emailAddresses
      .filter((e) => e.id !== emailAddress.id)
      .map((e) => e.id);

    for (const id of idsAEliminar) {
      await client.emailAddresses.deleteEmailAddress(id);
    }
  }

  async actualizarTelefono(
    usuarioId: string,
    nuevoTelefono: string,
  ): Promise<void> {
    await this.actualizarMetadatos(usuarioId, { telefono: nuevoTelefono });
  }

  async actualizarNombreCompleto(
    usuarioId: string,
    nombreCompleto: string,
  ): Promise<void> {
    const client = await clerkClient();

    const [firstName, ...resto] = nombreCompleto.trim().split(" ").filter(Boolean);
    const lastName = resto.join(" ") || undefined;

    await client.users.updateUser(usuarioId, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    });
  }
}