import { Usuario } from "../entities/Usuario";

export interface BaseRemitenteData {
  id_remitente: string;
  id_base: string;
  nombre: string;
  latitud: number;
  longitud: number;
  capacidad_pista: string;
  estado_cuenta: string;
  configuracionPendiente: boolean;
}

export interface ActualizarBaseRemitenteInput {
  nombre?: string;
  latitud?: number;
  longitud?: number;
  capacidad_pista?: string;
}

export interface CrearBaseRemitenteInput {
  nombre: string;
  latitud: number;
  longitud: number;
  capacidad_pista: string;
}

export interface DatosPerfilInput {
  nombre?: string;
  email?: string;
  telefono?: string;
}

export interface ForManagingUsuarios {
  buscarPorId(id: string): Promise<Usuario | null>;
  listarPendientes(): Promise<Usuario[]>;
  listarTodos(): Promise<Usuario[]>;
  guardar(usuario: Usuario): Promise<void>;
  eliminar(id: string): Promise<void>;
  listarBasesRemitentes(): Promise<BaseRemitenteData[]>;
  actualizarBaseRemitente(id: string, datos: ActualizarBaseRemitenteInput): Promise<void>;
  /** Resuelve la base que gestiona un remitente a partir de su ID de usuario */
  obtenerBaseDeRemitente(remitenteId: string): Promise<string | null>;
  crearBaseRemitente(id: string, datos: CrearBaseRemitenteInput): Promise<void>;
  baseExiste(id: string): Promise<boolean>;

  /** Guarda datos de perfil (nombre, email, telefono) en nuestra DB. */
  guardarDatosPerfil(id: string, datos: DatosPerfilInput): Promise<void>;
}
