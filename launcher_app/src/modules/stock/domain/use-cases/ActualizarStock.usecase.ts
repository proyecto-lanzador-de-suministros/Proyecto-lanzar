// ============================================================
// Caso de uso: Actualizar Stock (CU-18)
// Permite fijar un valor absoluto o aplicar un delta (suma/resta)
// sobre la cantidad disponible de un producto en una base.
// Valida que el resultado nunca sea negativo (CU-18, excepción Caso A).
// ============================================================

import { ForManagingStock } from "../ports/forManagingStock.port";

export interface ActualizarStockInput {
  id_base: string;
  productoId: string;
  /** Modo "absoluto": nuevaCantidad reemplaza el valor actual. */
  modo: "absoluto" | "delta";
  /** Para modo "absoluto": el nuevo total. Para modo "delta": cuánto sumar (negativo para restar). */
  valor: number;
}

export class ActualizarStockUseCase {
  constructor(private readonly stockRepository: ForManagingStock) {}

  async ejecutar(input: ActualizarStockInput): Promise<{ cantidadResultante: number }> {
    let cantidadResultante: number;

    if (input.modo === "absoluto") {
      if (!Number.isFinite(input.valor) || input.valor < 0) {
        throw new Error("La cantidad debe ser un número positivo.");
      }
      cantidadResultante = Math.trunc(input.valor);
    } else {
      // modo "delta": necesitamos el valor actual para calcular el resultante
      const stockActual = await this.stockRepository.consultarPorBase(input.id_base);
      const itemActual = stockActual.find((s) => s.productoId === input.productoId);
      const cantidadActual = itemActual?.cantidad_disponible ?? 0;

      cantidadResultante = cantidadActual + Math.trunc(input.valor);

      if (cantidadResultante < 0) {
        throw new Error(
          `La operación dejaría el stock en un valor negativo (actual: ${cantidadActual}, delta: ${input.valor}).`,
        );
      }
    }

    await this.stockRepository.actualizarCantidad(input.id_base, input.productoId, cantidadResultante);

    return { cantidadResultante };
  }
}