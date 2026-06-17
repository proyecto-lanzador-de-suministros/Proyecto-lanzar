import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud } from "../entities/Solicitud";

export class CambiarEstadoSolicitudUseCase {
  constructor(private repository: ForManagingSolicitudes) {}

  async ejecutar(id: string, nuevoEstado: EstadoSolicitud): Promise<void> {
    await this.repository.actualizarEstado(id, nuevoEstado);
  }
}
