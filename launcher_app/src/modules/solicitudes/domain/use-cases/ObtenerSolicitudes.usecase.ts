// ============================================================
// Caso de uso: Obtener Solicitudes
// Lista todas las solicitudes con filtro opcional de estado.
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud } from "../entities/Solicitud";

export class ObtenerSolicitudesUseCase {
  constructor(private readonly repository: ForManagingSolicitudes) {}

  async ejecutar(estadoFiltro?: EstadoSolicitud): Promise<Solicitud[]> {
    return this.repository.listarTodas(estadoFiltro);
  }
}
