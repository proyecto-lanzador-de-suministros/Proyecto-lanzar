import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export class ObtenerSolicitudesUseCase {
  constructor(private repository: ForManagingSolicitudes) {}

  async execute(): Promise<Solicitud[]> {
    return this.repository.obtenerTodas();
  }
}