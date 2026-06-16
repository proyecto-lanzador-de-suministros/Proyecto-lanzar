import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud } from "../entities/Solicitud";

export class CambiarEstadoSolicitudUseCase {
  constructor(private repository: ForManagingSolicitudes) {}

  async execute(id: string, nuevoEstado: EstadoSolicitud): Promise<Solicitud> {
    // Aquí en un futuro meteremos validaciones de la máquina de estados.
    return this.repository.cambiarEstado(id, nuevoEstado);
  }
}