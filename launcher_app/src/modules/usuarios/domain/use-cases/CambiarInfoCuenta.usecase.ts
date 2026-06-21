import { Errores } from "@/src/modules/errors/domain/factories";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";
import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";

export interface CambiarInfoCuentaInput {
  usuarioId: string;
  nombre?: string;
  email?: string;
  telefono?: string;
}

export class CambiarInfoCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly clerkSyncAdapter: ForSyncingExternalAuth,
  ) {}

  async execute(input: CambiarInfoCuentaInput): Promise<void> {
    const { usuarioId, nombre, email, telefono } = input;

    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw Errores.usuarioNoEncontrado(usuarioId);
    }

    if (nombre) {
      await this.clerkSyncAdapter.actualizarNombreCompleto(usuarioId, nombre);
    }

    if (email) {
      await this.clerkSyncAdapter.actualizarEmail(usuarioId, email);
    }

    if (telefono) {
      await this.clerkSyncAdapter.actualizarTelefono(usuarioId, telefono);
    }

    await this.usuarioRepository.guardarDatosPerfil(usuarioId, {
      ...(nombre !== undefined && { nombre }),
      ...(email !== undefined && { email }),
      ...(telefono !== undefined && { telefono }),
    });
  }
}
