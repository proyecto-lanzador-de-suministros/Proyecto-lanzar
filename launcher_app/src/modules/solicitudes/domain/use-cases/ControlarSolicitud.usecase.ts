// ============================================================
// Caso de uso: Controlar Solicitud (CU-09)
// Verifica stock, asigna base remitente y actualiza estado.
// Es invocado por CrearSolicitud (CU-08) automáticamente.
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";
import { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";
import { NotificarRechazo } from "@/src/modules/notificaciones/domain/use-cases/NotificarRechazo.usecase";

export interface ControlarSolicitudOutput {
  solicitud: Solicitud;
  asignada: boolean;
  stockFaltante?: string[]; // IDs de productos sin stock suficiente
}

export class ControlarSolicitud {
  constructor(
    private readonly repo: ForManagingSolicitudes,
    private readonly stock: ForManagingStock,
    private readonly notificarRechazo: NotificarRechazo,
  ) {}

  async ejecutar(solicitud: Solicitud): Promise<ControlarSolicitudOutput> {
    // 1. Verificar disponibilidad y obtener la base más cercana con stock
    const resultado = await this.stock.verificarYReservar({
      ubicacion_destino: solicitud.ubicacion_destino,
      productos: solicitud.productos,
    });

    if (!resultado.disponible) {
      // 2a. Sin stock → rechazar
      solicitud.rechazar();
      await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado);

      // Notificar al solicitante — best-effort
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

    // 2b. Con stock → asignar base y pasar a "asignada"
    solicitud.asignar(resultado.id_base!);
    await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado, {
      id_base: resultado.id_base,
    });

    return {
      solicitud,
      asignada: true,
    };
  }
}