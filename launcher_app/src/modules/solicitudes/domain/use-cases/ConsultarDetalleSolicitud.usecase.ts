// ============================================================
// Caso de uso: Consultar Detalle de Solicitud (CU-20)
// A diferencia de ConsultarSolicitud (que valida permisos por rol
// dentro del propio caso de uso), este caso de uso no valida
// pertenencia: trae la solicitud junto con su historial completo
// de cambios de estado. La validación de acceso queda a cargo
// del caller (server action), según el rol del usuario.
// Usado por Admin (sin restricción) y por Solicitante
// (validando que la solicitud le pertenezca).
// ============================================================

import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial, HistorialEntry } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { Solicitud } from "../entities/Solicitud";

export interface DetalleSolicitudAdminOutput {
  solicitud: Solicitud;
  historial: HistorialEntry[];
}

export class ConsultarDetalleSolicitudUseCase {
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