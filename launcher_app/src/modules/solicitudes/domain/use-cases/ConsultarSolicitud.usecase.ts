// ============================================================
// Caso de uso: Consultar Solicitud (CU-20)
// Devuelve el detalle de una solicitud según el rol del actor.
// Solicitante: solo las propias. Remitente: las asignadas. Admin: todas.
// ============================================================

import { Errores } from "@/src/modules/errors/domain/factories";
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
      throw Errores.solicitudNoEncontrada(input.id_solicitud);
    }

    // Verificar acceso según rol
    if (input.rol === "solicitante" && solicitud.id_usuario !== input.id_usuario) {
      throw Errores.permisoDenegado("solicitante", input.rol);
    }

    if (input.rol === "remitente" && solicitud.id_remitente !== input.id_base) {
      throw Errores.permisoDenegado("remitente", input.rol);
    }

    return solicitud;
  }
}