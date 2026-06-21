import { ForManagingUsuarios, CrearBaseRemitenteInput } from "../ports/forManagingUsuarios.port";
import { ForSyncingExternalAuth } from "@/src/modules/auth/domain/ports/forSyncingExternalAuth.port";

export interface CrearBaseRemitenteOutput {
  id: string;
}

export class CrearBaseRemitenteUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly externalAuth: ForSyncingExternalAuth,
  ) {}

  async ejecutar(datos: {
    email: string;
    password: string;
    nombreContacto: string;
    nombreBase: string;
    latitudBase: number;
    longitudBase: number;
    capacidadPista: string;
  }): Promise<CrearBaseRemitenteOutput> {
    if (!datos.email.includes("@")) {
      throw new Error("Ingresá un email válido.");
    }
    if (datos.password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres.");
    }
    if (datos.nombreContacto.trim() === "") {
      throw new Error("El nombre de contacto no puede estar vacío.");
    }
    if (datos.nombreBase.trim() === "") {
      throw new Error("El nombre de la base no puede estar vacío.");
    }
    if (!Number.isFinite(datos.latitudBase) || datos.latitudBase < -90 || datos.latitudBase > 90) {
      throw new Error("Latitud inválida. Debe estar entre -90 y 90.");
    }
    if (!Number.isFinite(datos.longitudBase) || datos.longitudBase < -180 || datos.longitudBase > 180) {
      throw new Error("Longitud inválida. Debe estar entre -180 y 180.");
    }
    if (datos.capacidadPista.trim() === "") {
      throw new Error("Seleccioná una capacidad de pista.");
    }

    const { id } = await this.externalAuth.crearUsuarioExterno({
      email: datos.email,
      password: datos.password,
      nombre: datos.nombreContacto,
      rol: "remitente",
    });

    const perfil: CrearBaseRemitenteInput = {
      nombre: datos.nombreBase,
      latitud: datos.latitudBase,
      longitud: datos.longitudBase,
      capacidad_pista: datos.capacidadPista,
    };

    await this.usuarioRepository.crearBaseRemitente(id, perfil);

    return { id };
  }
}
