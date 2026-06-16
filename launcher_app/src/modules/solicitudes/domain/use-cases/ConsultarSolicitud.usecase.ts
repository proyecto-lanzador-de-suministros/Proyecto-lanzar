// ============================================================
// Caso de uso: Consultar Solicitud (CU-20)
// Devuelve el detalle de una solicitud según el rol del actor.
// Solicitante: solo las propias. Remitente: las asignadas. Admin: todas.
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";

export interface ConsultarSolicitudInput {
  id_solicitud: string;
  id_usuario: string;
  rol: "solicitante" | "remitente" | "admin";
  id_base?: string; // requerido si rol === "remitente"
}

export class ConsultarSolicitud {
  constructor(private readonly repo: ForManagingSolicitudes) {}

  async ejecutar(input: ConsultarSolicitudInput): Promise<Solicitud> {
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);

    if (!solicitud) {
      throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);
    }

    // Verificar acceso según rol
    if (input.rol === "solicitante" && solicitud.id_usuario !== input.id_usuario) {
      throw new Error("No tenés permiso para consultar esta solicitud.");
    }

    if (input.rol === "remitente" && solicitud.id_base !== input.id_base) {
      throw new Error("Esta solicitud no está asignada a tu base.");
    }

    return solicitud;
  }
}