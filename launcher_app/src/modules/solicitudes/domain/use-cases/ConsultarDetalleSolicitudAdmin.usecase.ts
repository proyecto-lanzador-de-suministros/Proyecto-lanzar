// ============================================================
// Caso de uso: Consultar Detalle de Solicitud para Admin (CU-20)
// A diferencia de ConsultarSolicitud (que valida permisos por rol),
// este es de uso exclusivo del admin: siempre puede ver cualquier
// solicitud junto con su historial completo de cambios de estado.
// ============================================================

import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial, HistorialEntry } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { Solicitud } from "../entities/Solicitud";

export interface DetalleSolicitudAdminOutput {
  solicitud: Solicitud;
  historial: HistorialEntry[];
}

export class ConsultarDetalleSolicitudAdminUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly historialRepository: ForManagingHistorial,
  ) {}

  async ejecutar(solicitudId: string): Promise<DetalleSolicitudAdminOutput> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    const historial = await this.historialRepository.listarPorSolicitud(solicitudId);

    return { solicitud, historial };
  }
}