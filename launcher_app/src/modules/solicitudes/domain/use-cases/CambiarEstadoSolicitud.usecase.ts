import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud } from "../entities/Solicitud";

export class CambiarEstadoSolicitudUseCase {
  constructor(private repository: ForManagingSolicitudes) {}

  async execute(id: string, nuevoEstado: EstadoSolicitud): Promise<void> {
    await this.repository.actualizarEstado(id, nuevoEstado);
  }
}