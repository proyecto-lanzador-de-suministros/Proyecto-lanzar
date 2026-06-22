import { Errores } from "@/src/modules/errors/domain/factories";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";
import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";

export interface CambiarInfoLoginInput {
    usuarioId: string;
    nuevoUsername?: string;
    nuevaPassword?: string;
}

export class CambiarInfoLoginUseCase {
    constructor(
        private readonly usuarioRepository: ForManagingUsuarios,
        private readonly clerkSyncAdapter: ForSyncingExternalAuth,
    ) { }

    async execute(input: CambiarInfoLoginInput): Promise<void> {
        const { usuarioId, nuevoUsername, nuevaPassword } = input;

        const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
        if (!usuario) {
            throw Errores.usuarioNoEncontrado(usuarioId);
        }

        if (nuevoUsername) {
            await this.clerkSyncAdapter.actualizarNombreUsuario(
                usuarioId,
                nuevoUsername,
            );
        }

        if (nuevaPassword) {
            await this.clerkSyncAdapter.actualizarContrasena(
                usuarioId,
                nuevaPassword,
            );
        }
    }
}
