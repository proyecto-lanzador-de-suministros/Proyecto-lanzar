import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";
import { Usuario, RolUsuario } from "../entities/Usuario";
import { Base } from "../entities/Base";

export interface DatosBaseInput {
  nombre: string;
  posicionBase: string;
  direccion: string;
}

export interface CrearUsuarioAdminInput {
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
  datosBase?: DatosBaseInput;
}

export interface CrearUsuarioAdminOutput {
  id: string;
}

export class CrearUsuarioAdminUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
  ) {}

  async ejecutar(input: CrearUsuarioAdminInput): Promise<CrearUsuarioAdminOutput> {
    if (!input.email.includes("@")) {
      throw new Error("Ingresá un email válido.");
    }

    if (input.password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }

    if (input.nombre.trim() === "") {
      throw new Error("El nombre no puede estar vacío.");
    }

    const rolExterno = input.rol === "ADMINISTRADOR" ? "admin" : input.rol === "REMITENTE" ? "remitente" : "solicitante";

    const { id } = await this.externalAuth.crearUsuarioExterno({
      email: input.email,
      password: input.password,
      nombre: input.nombre,
      rol: rolExterno,
    });

    const estadoInicial = Usuario.estadoInicial(input.rol, true);

    const usuario = new Usuario(
      id,
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

    try {
      await this.usuarioRepository.crear(usuario, datosBase);
    } catch (error) {
      await this.externalAuth.eliminarUsuarioExterno(id).catch(() => {});
      throw error;
    }

    return { id };
  }
}
