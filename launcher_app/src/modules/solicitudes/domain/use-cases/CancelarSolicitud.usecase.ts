// ============================================================
// Caso de uso: Cancelar Solicitud (CU-10)
// Permite al solicitante o admin cancelar en estados tempranos.
// Libera el stock reservado si la solicitud tenía base asignada.
// ============================================================

import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";
import { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";
import { NotificarCancelacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarCancelacion.usecase";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

export interface CancelarSolicitudInput {
  id_solicitud: string;
  id_usuario: string;
  rol: "solicitante" | "admin";
  motivo?: string;
}

export class CancelarSolicitud {
  constructor(
    private readonly repo: ForManagingSolicitudes,
    private readonly stock: ForManagingStock,
    private readonly notificarCancelacion: NotificarCancelacion,
    private readonly historial: ForManagingHistorial,
  ) {}

  async ejecutar(input: CancelarSolicitudInput): Promise<Solicitud> {
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(input.id_solicitud);
    }

    if (input.rol === "solicitante" && solicitud.id_usuario !== input.id_usuario) {
      throw Errores.permisoDenegado("solicitante", input.rol);
    }

    const estadoAnterior = solicitud.estado;

    solicitud.cancelar(input.motivo);

    if (solicitud.id_base) {
      await this.stock.liberarReserva({
        id_base: solicitud.id_base,
        productos: solicitud.productos,
      });
    }

    await this.repo.actualizarEstado(
      solicitud.id_solicitud,
      solicitud.estado,
      { motivoCancelacion: input.motivo },
    );

    try {
      await this.historial.registrar({
        solicitudId: solicitud.id_solicitud,
        estadoAnterior,
        estadoNuevo: solicitud.estado,
        actorId: input.id_usuario,
        motivo: input.motivo,
      });
    } catch {
      // fire-and-forget
    }

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