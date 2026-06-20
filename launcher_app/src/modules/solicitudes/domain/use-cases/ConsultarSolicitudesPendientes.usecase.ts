// ============================================================
// Caso de uso: Consultar Solicitudes Pendientes (CU-19)
// Remitente: ve las asignadas a su base.
// Admin: ve todas las pendientes.
// ============================================================

import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export interface ConsultarSolicitudesPendientesInput {
  rol: "remitente" | "admin";
  id_base?: string; // requerido si rol === "remitente"
}

export class ConsultarSolicitudesPendientes {
  constructor(private readonly repo: ForManagingSolicitudes) {}

  async ejecutar(
    input: ConsultarSolicitudesPendientesInput,
  ): Promise<Solicitud[]> {
    if (input.rol === "remitente") {
      if (!input.id_base) {
        throw Errores.faltaIdBase();
      }
      return this.repo.listarPendientes(input.id_base);
    }

    // Admin ve todas sin filtro de base
    return this.repo.listarTodas("asignada");
  }
}