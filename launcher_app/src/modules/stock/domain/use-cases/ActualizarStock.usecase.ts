// ============================================================
// Caso de uso: Actualizar Stock (CU-18)
// Permite fijar un valor absoluto o aplicar un delta (suma/resta)
// sobre la cantidad disponible de un producto en una base.
// Valida que el resultado nunca sea negativo (CU-18, excepción Caso A).
// Registra cada cambio en el historial de auditoría de stock
// (CU-18, postcondición "el historial de actualizaciones queda registrado").
// ============================================================

import { ForManagingStock } from "../ports/forManagingStock.port";
import { ForManagingHistorialStock } from "../ports/forManagingHistorialStock.port";

export interface ActualizarStockInput {
  id_base: string;
  productoId: string;
  /** Modo "absoluto": nuevaCantidad reemplaza el valor actual. */
  modo: "absoluto" | "delta";
  /** Para modo "absoluto": el nuevo total. Para modo "delta": cuánto sumar (negativo para restar). */
  valor: number;
  /** Quién hace el cambio (admin o remitente), para el historial. */
  actorId: string;
}

export class ActualizarStockUseCase {
  constructor(
    private readonly stockRepository: ForManagingStock,
    private readonly historialStockRepository: ForManagingHistorialStock,
  ) {}

  async ejecutar(input: ActualizarStockInput): Promise<{ cantidadResultante: number }> {
    // Necesitamos el valor actual en ambos modos: en "delta" como base del
    // cálculo, y en "absoluto" para poder registrar el historial del cambio.
    const stockActual = await this.stockRepository.consultarPorBase(input.id_base);
    const itemActual = stockActual.find((s) => s.productoId === input.productoId);
    const cantidadAnterior = itemActual?.cantidad_disponible ?? 0;

    let cantidadResultante: number;

    if (input.modo === "absoluto") {
      if (!Number.isFinite(input.valor) || input.valor < 0) {
        throw new Error("La cantidad debe ser un número positivo.");
      }
      cantidadResultante = Math.trunc(input.valor);
    } else {
      cantidadResultante = cantidadAnterior + Math.trunc(input.valor);

      if (cantidadResultante < 0) {
        throw new Error(
          `La operación dejaría el stock en un valor negativo (actual: ${cantidadAnterior}, delta: ${input.valor}).`,
        );
      }
    }

    await this.stockRepository.actualizarCantidad(input.id_base, input.productoId, cantidadResultante);

    // Best-effort: si falla el registro de auditoría no debe revertir el cambio de stock.
    try {
      await this.historialStockRepository.registrar({
        id_base: input.id_base,
        id_producto: input.productoId,
        cantidadAnterior,
        cantidadNueva: cantidadResultante,
        actorId: input.actorId,
      });
    } catch {
      // fire-and-forget
    }

    return { cantidadResultante };
  }
}