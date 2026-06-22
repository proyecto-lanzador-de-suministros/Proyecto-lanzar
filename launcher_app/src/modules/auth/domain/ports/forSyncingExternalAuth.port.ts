/**
 * Puerto de salida. Define la interfaz para sincronizar el estado
 * de una cuenta de usuario con el proveedor de identidad externo (Clerk).
 *
 * Existe porque AprobarCuentaUseCase necesita actualizar dos fuentes:
 * 1. PostgreSQL (la entidad Usuario del dominio).
 * 2. El IdP externo (Clerk), para que los tokens JWT del usuario
 *    reflejen el nuevo estado sin necesidad de un nuevo login.
 *
 * CrearCuentaUseCase (alta directa por admin) también depende de este
 * puerto: necesita pedirle al IdP externo que cree el usuario con
 * email/password antes de poder persistir el perfil en Postgres.
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

  /**
   * Crea un usuario nuevo directamente en el IdP externo (alta por admin,
   * CU-01 variante administrativa — sin pasar por self-signup).
   * Devuelve el ID externo (Clerk userId) que se usará como id_usuario
   * en Postgres, manteniendo el mismo esquema de IDs compartidos que
   * usa el resto del sistema (ADR-006).
   */
  crearUsuarioExterno(datos: {
    email: string;
    password: string;
    nombre?: string;
    rol: "admin" | "remitente" | "solicitante";
  }): Promise<{ id: string }>;

  /**
   * Cambia el nombre de usuario (username) en el IdP externo.
   * Usado por CU-03 CambiarInfoLogin.
   */
  actualizarNombreUsuario(
    usuarioId: string,
    nuevoUsername: string,
  ): Promise<void>;

  /**
   * Cambia la contraseña en el IdP externo.
   * Usado por CU-03 CambiarInfoLogin.
   */
  actualizarContrasena(
    usuarioId: string,
    nuevaPassword: string,
  ): Promise<void>;

  /**
   * Cambia el email principal en el IdP externo.
   * Usado por CU-04 CambiarInfoCuenta.
   */
  actualizarEmail(
    usuarioId: string,
    nuevoEmail: string,
  ): Promise<void>;

  /**
   * Cambia el teléfono en el IdP externo (guardado en publicMetadata).
   * Usado por CU-04 CambiarInfoCuenta.
   */
  actualizarTelefono(
    usuarioId: string,
    nuevoTelefono: string,
  ): Promise<void>;

  /**
   * Cambia el nombre completo (firstName / lastName) en el IdP externo.
   * Recibe el nombre completo en un solo string y lo divide.
   * Usado por CU-04 CambiarInfoCuenta.
   */
  actualizarNombreCompleto(
    usuarioId: string,
    nombreCompleto: string,
  ): Promise<void>;

  /**
   * Elimina un usuario del IdP externo.
   * Usado para rollback cuando la persistencia en Postgres falla
   * después de crear el usuario en el IdP.
   */
  eliminarUsuarioExterno(usuarioId: string): Promise<void>;
}