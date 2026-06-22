import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";
import { Usuario, RolUsuario } from "../entities/Usuario";
import { Base } from "../entities/Base";

export interface CompletarRegistroInput {
  usuarioId: string;
  email: string;
  rol: RolUsuario;
  nombre: string;
  datosBase?: {
    nombre: string;
    posicionBase: string;
    direccion: string;
  };
}

export class CompletarRegistroUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
  ) {}

  async ejecutar(input: CompletarRegistroInput): Promise<void> {
    if (input.nombre.trim() === "") {
      throw new Error("El nombre no puede estar vacío.");
    }

    if (input.rol === "REMITENTE" && !input.datosBase) {
      throw new Error("El remitente debe proporcionar los datos de la base.");
    }

    const rolExterno = input.rol === "REMITENTE" ? "remitente" : "solicitante";

    const existente = await this.usuarioRepository.buscarPorId(input.usuarioId);

    if (!existente) {
      const estadoInicial = Usuario.estadoInicial(input.rol, false);

      const usuario = new Usuario(
        input.usuarioId,
        estadoInicial,
        input.rol,
        input.nombre,
        input.email,
      );

      let datosBase: Base | undefined;
      if (input.datosBase) {
        datosBase = new Base(
          input.datosBase.nombre,
          input.datosBase.posicionBase,
          input.datosBase.direccion,
        );
      }

      await this.usuarioRepository.crear(usuario, datosBase);
    }

    await this.externalAuth.actualizarMetadatos(input.usuarioId, {
      rol: rolExterno,
    });
  }
}
