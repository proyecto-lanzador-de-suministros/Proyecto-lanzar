import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";
import { ForNotifyingCuenta } from "@/src/modules/notificaciones/domain/ports/forNotifyingCuenta.port";

export class RechazarCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
    private readonly notificarCuenta: ForNotifyingCuenta,
  ) {}

  /**
   * Rechaza una cuenta pendiente (CU-02, Caso A). Simétrico a AprobarCuentaUseCase:
   * actualiza el estado en Postgres, sincroniza el metadato en Clerk (ADR-006)
   * y notifica al usuario del resultado (CU-02, postcondición 3).
   *
   * A diferencia de AprobarCuentaUseCase, NO crea ningún perfil por rol
   * (Remitente/Solicitante/Administrador) — el rechazo es justamente
   * la decisión de no habilitar ese perfil.
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

    // Notificar al usuario — best-effort
    try {
      await this.notificarCuenta.notificarRechazo(usuarioId);
    } catch {
      // fire-and-forget
    }
  }
}