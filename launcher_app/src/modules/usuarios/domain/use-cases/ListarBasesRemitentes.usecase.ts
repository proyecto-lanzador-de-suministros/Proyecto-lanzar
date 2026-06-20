import { ForManagingUsuarios, BaseRemitenteData } from "../ports/forManagingUsuarios.port";

export class ListarBasesRemitentesUseCase {
  constructor(private readonly usuarioRepository: ForManagingUsuarios) {}

  async ejecutar(): Promise<BaseRemitenteData[]> {
    return this.usuarioRepository.listarBasesRemitentes();
  }
}
