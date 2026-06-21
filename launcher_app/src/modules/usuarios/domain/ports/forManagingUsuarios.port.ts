import { Usuario } from "../entities/Usuario";

export interface BaseRemitenteData {
  id_remitente: string;
  nombre_base: string;
  latitud_base: number;
  longitud_base: number;
  capacidad_pista: string;
  estado_cuenta: string;
  configuracionPendiente: boolean;
}

export interface ActualizarBaseRemitenteInput {
  nombre_base?: string;
  latitud_base?: number;
  longitud_base?: number;
  capacidad_pista?: string;
}

export interface CrearBaseRemitenteInput {
  nombre_base: string;
  latitud_base: number;
  longitud_base: number;
  capacidad_pista: string;
}

export interface ForManagingUsuarios {
  buscarPorId(id: string): Promise<Usuario | null>;
  listarPendientes(): Promise<Usuario[]>;
  listarTodos(): Promise<Usuario[]>;
  guardar(usuario: Usuario): Promise<void>;
  eliminar(id: string): Promise<void>;
  listarBasesRemitentes(): Promise<BaseRemitenteData[]>;
  actualizarBaseRemitente(id: string, datos: ActualizarBaseRemitenteInput): Promise<void>;
  crearBaseRemitente(id: string, datos: CrearBaseRemitenteInput): Promise<void>;
  baseExiste(id: string): Promise<boolean>;
}