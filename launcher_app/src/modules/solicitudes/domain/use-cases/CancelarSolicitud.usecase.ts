// ============================================================
// Caso de uso: Cancelar Solicitud (CU-10)
// Permite al solicitante o admin cancelar en estados tempranos.
// Libera el stock reservado si la solicitud tenía base asignada.
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";
import { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";
import { NotificarCancelacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarCancelacion.usecase";

export interface CancelarSolicitudInput {
  id_solicitud: string;
  id_usuario: string;     // quien cancela (para verificar pertenencia)
  rol: "solicitante" | "admin";
  motivo?: string;
}

export class CancelarSolicitud {
  constructor(
    private readonly repo: ForManagingSolicitudes,
    private readonly stock: ForManagingStock,
    private readonly notificarCancelacion: NotificarCancelacion,
) {}

  async ejecutar(input: CancelarSolicitudInput): Promise<Solicitud> {
    // 1. Buscar la solicitud
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);

    if (!solicitud) {
      throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);
    }

    // 2. Verificar pertenencia si es solicitante
    if (input.rol === "solicitante" && solicitud.id_usuario !== input.id_usuario) {
      throw new Error("No tenés permiso para cancelar esta solicitud.");
    }

    // 3. La entidad valida que el estado permita cancelación
    solicitud.cancelar(input.motivo);

    // 4. Liberar stock si había base asignada
    if (solicitud.id_base) {
      await this.stock.liberarReserva({
        id_base: solicitud.id_base,
        productos: solicitud.productos,
      });
    }

    // 5. Persistir el nuevo estado
    await this.repo.actualizarEstado(
      solicitud.id_solicitud,
      solicitud.estado,
      { motivoCancelacion: input.motivo },
    );

    // 6. Notificar al solicitante — best-effort
    try {
      await this.notificarCancelacion.ejecutar(
        solicitud.id_solicitud,
        solicitud.id_usuario,
      );
    } catch {
      // fire-and-forget
    }

    return solicitud;
  }
}