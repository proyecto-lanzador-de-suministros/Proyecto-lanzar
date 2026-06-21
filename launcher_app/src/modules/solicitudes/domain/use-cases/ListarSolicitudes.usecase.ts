// ============================================================
// Caso de uso: Listar Solicitudes
// Lista solicitudes según el rol del actor autenticado.
// - Admin: todas las solicitudes
// - Solicitante: solo sus solicitudes
// - Remitente: solo las asignadas a su base
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud } from "../entities/Solicitud";

export interface ListarSolicitudesInput {
  rol: "solicitante" | "remitente" | "admin";
  idUsuario: string;
  idBase?: string;
  estadoFiltro?: EstadoSolicitud;
}

export class ListarSolicitudesUseCase {
  constructor(private readonly repository: ForManagingSolicitudes) {}

  async ejecutar(input: ListarSolicitudesInput): Promise<Solicitud[]> {
    switch (input.rol) {
      case "admin":
        return this.repository.listarTodas(input.estadoFiltro);
      case "solicitante":
        return this.repository.listarPorSolicitante(input.idUsuario);
      case "remitente":
        if (!input.idBase) throw new Error("Remitente sin base asignada");
        return this.repository.listarPorBase(input.idBase);
      default:
        return [];
    }
  }
}
