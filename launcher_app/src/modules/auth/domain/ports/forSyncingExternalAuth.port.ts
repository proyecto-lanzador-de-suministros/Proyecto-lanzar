/**
 * Puerto de salida. Define la interfaz para sincronizar el estado
 * de una cuenta de usuario con el proveedor de identidad externo (Clerk).
 *
 * Existe porque AprobarCuentaUseCase necesita actualizar dos fuentes:
 * 1. PostgreSQL (la entidad Usuario del dominio).
 * 2. El IdP externo (Clerk), para que los tokens JWT del usuario
 *    reflejen el nuevo estado sin necesidad de un nuevo login.
 */
export interface ForSyncingExternalAuth {
  /**
   * Actualiza los metadatos públicos del usuario en el IdP externo.
   * El backend puede leer estos metadatos desde el JWT en cada request.
   */
  actualizarMetadatos(
    usuarioId: string,
    metadatos: Record<string, unknown>,
  ): Promise<void>;
}