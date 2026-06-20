import { ForManagingTestData } from "../ports/forManagingTestData.port";

export class InicializarDatosPruebaUseCase {
  constructor(private readonly testDataRepository: ForManagingTestData) {}

  async ejecutar(usuarioId: string): Promise<void> {
    await this.testDataRepository.ensureSolicitanteExists(usuarioId);
    await this.testDataRepository.ensureTestDataSeeded();
  }
}
