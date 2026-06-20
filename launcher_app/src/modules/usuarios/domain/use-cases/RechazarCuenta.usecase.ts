import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";

export class RechazarCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
  ) {}

  /**
   * Rechaza una cuenta pendiente (CU-02, Caso A).
   * Simétrico a AprobarCuentaUseCase: actualiza el estado en Postgres
   * y sincroniza el metadato en Clerk para que el JWT del usuario
   * refleje el rechazo sin necesidad de un nuevo login (ADR-006).
   *
   * A diferencia de AprobarCuentaUseCase, NO crea ningún perfil por rol
   * (Remitente/Solicitante/Administrador) — el rechazo es justamente
   * la decisión de no habilitar ese perfil.
   *
   * Limitación conocida: el modelo Notificacion requiere id_solicitud
   * (FK no-nullable a Solicitud), así que no existe hoy una forma de
   * notificar el rechazo por el canal de notificaciones existente sin
   * una migración de esquema. Queda pendiente para cuando se decida
   * extender ese modelo.
   */
  async ejecutar(usuarioId: string): Promise<void> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    if (usuario.estadoCuenta === "RECHAZADA") {
      throw new Error("La cuenta ya se encuentra rechazada.");
    }

    usuario.rechazar();

    await this.usuarioRepository.guardar(usuario);

    await this.externalAuth.actualizarMetadatos(usuarioId, {
      status: "rechazada",
    });
  }
}