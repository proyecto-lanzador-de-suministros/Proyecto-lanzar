import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { Usuario } from "../entities/Usuario";

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: ForManagingUsuarios) {}

  async ejecutar(): Promise<Usuario[]> {
    return await this.usuarioRepository.listarTodos();
  }
}