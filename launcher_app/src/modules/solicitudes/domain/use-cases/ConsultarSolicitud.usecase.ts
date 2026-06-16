import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export class ConsultarSolicitudUseCase {
  constructor(private readonly solicitudRepository: ForManagingSolicitudes) {}

  async ejecutar(solicitudId: string): Promise<Solicitud | null> {
    return await this.solicitudRepository.buscarPorId(solicitudId);
  }
}