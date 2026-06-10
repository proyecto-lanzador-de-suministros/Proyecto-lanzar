import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export class ListarSolicitudesAdminUseCase {
  constructor(private readonly solicitudRepository: ForManagingSolicitudes) {}

  async ejecutar(estado?: string): Promise<Solicitud[]> {
    return await this.solicitudRepository.listarTodas(estado);
  }
}