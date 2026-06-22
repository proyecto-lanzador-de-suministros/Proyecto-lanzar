// ============================================================
// Caso de uso: Controlar Solicitud (CU-09)
// Verifica stock, asigna base remitente y actualiza estado.
// Es invocado por CrearSolicitud (CU-08) automáticamente.
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";
import { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";
import { NotificarRechazo } from "@/src/modules/notificaciones/domain/use-cases/NotificarRechazo.usecase";
import { NotificarAsignacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarAsignacion.usecase";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

export interface ControlarSolicitudOutput {
  solicitud: Solicitud;
  asignada: boolean;
  stockFaltante?: string[];
}

export class ControlarSolicitud {
  constructor(
    private readonly repo: ForManagingSolicitudes,
    private readonly stock: ForManagingStock,
    private readonly notificarRechazo: NotificarRechazo,
    private readonly notificarAsignacion: NotificarAsignacion,
    private readonly historial: ForManagingHistorial,
  ) {}

  async ejecutar(solicitud: Solicitud): Promise<ControlarSolicitudOutput> {
    const estadoAnterior = solicitud.estado; // "Creada", antes de resolver el control de stock

    const resultado = await this.stock.verificarYReservar({
      ubicacion_destino: solicitud.ubicacion_destino,
      productos: solicitud.productos,
    });

    if (!resultado.disponible) {
      solicitud.rechazar();
      await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado);

      try {
        await this.historial.registrar({
          solicitudId: solicitud.id_solicitud,
          estadoAnterior,
          estadoNuevo: solicitud.estado,
          actorId: solicitud.id_usuario,
        });
      } catch {
        // fire-and-forget
      }

      try {
        await this.notificarRechazo.ejecutar(solicitud.id_solicitud, solicitud.id_usuario);
      } catch {
        // fire-and-forget
      }

      return {
        solicitud,
        asignada: false,
        stockFaltante: resultado.productosFaltantes,
      };
    }

    solicitud.asignar(resultado.id_base!);
    await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado, {
      id_base: resultado.id_base,
    });

    try {
      await this.historial.registrar({
        solicitudId: solicitud.id_solicitud,
        estadoAnterior,
        estadoNuevo: solicitud.estado,
        actorId: solicitud.id_usuario,
      });
    } catch {
      // fire-and-forget
    }

    // CU-09, paso 5: notificar al solicitante y al remitente asignado.
    try {
      await this.notificarAsignacion.ejecutar(
        solicitud.id_solicitud,
        solicitud.id_usuario,
        resultado.id_base!,
      );
    } catch {
      // fire-and-forget
    }

    return {
      solicitud,
      asignada: true,
    };
  }
}