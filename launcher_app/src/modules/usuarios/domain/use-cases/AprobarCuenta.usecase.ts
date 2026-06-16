import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";

export class AprobarCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
  ) {}

  /**
   * Aprueba una cuenta pendiente (CU-02).
   *
   * Actualiza el estado en PostgreSQL y sincroniza el metadato
   * en Clerk para que el JWT del usuario refleje el nuevo estado
   * sin necesidad de un nuevo login (requerido por ADR-006).
   */
  async ejecutar(usuarioId: string): Promise<void> {
    // 1. Buscar al usuario en Postgres
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    if (usuario.estadoCuenta === "APROBADA") {
      throw new Error("La cuenta ya se encuentra aprobada.");
    }

    // 2. Cambiar estado en la entidad del dominio
    usuario.aprobar();

    // 3. Persistir en Postgres
    await this.usuarioRepository.guardar(usuario);

    // 4. Sincronizar con Clerk para que el JWT refleje el cambio
    //    El campo "status" es el que lee el frontend (publicMetadata.status)
    await this.externalAuth.actualizarMetadatos(usuarioId, {
      status: "aprobada",
    });
  }
}