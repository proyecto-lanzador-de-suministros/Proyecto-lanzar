import { ForManagingEnvios, Envio } from "../ports/forManagingEnvios.port";

export class ListarEnviosUseCase {
  constructor(private readonly envioRepository: ForManagingEnvios) {}

  async ejecutar(): Promise<Envio[]> {
    return this.envioRepository.listarTodos();
  }
}
