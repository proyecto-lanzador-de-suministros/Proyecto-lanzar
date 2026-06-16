import { Usuario } from "../entities/Usuario";

export interface ForManagingUsuarios {
  buscarPorId(id: string): Promise<Usuario | null>;
  listarPendientes(): Promise<Usuario[]>;
  listarTodos(): Promise<Usuario[]>;
  guardar(usuario: Usuario): Promise<void>;
  eliminar(id: string): Promise<void>;
}