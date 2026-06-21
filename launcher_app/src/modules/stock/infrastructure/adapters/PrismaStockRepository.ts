// ============================================================
// Adaptador: PrismaStockRepository
// Implementa ForManagingStock usando Prisma + PostgreSQL.
// Garantiza consistencia con transacciones ACID (ADR-002).
// ============================================================

import { ForManagingStock, VerificarYReservarInput, VerificarYReservarOutput, LiberarReservaInput, StockItem } from "../../domain/ports/forManagingStock.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaStockRepository implements ForManagingStock {

  /**
   * CU-09: Busca la base con stock suficiente más cercana al destino
   * y reserva los productos en una transacción ACID.
   */
  async verificarYReservar(input: VerificarYReservarInput): Promise<VerificarYReservarOutput> {
    const [lon, lat] = input.ubicacion_destino.coordinates;

    // 1. Obtener todas las bases (remitentes) con sus coordenadas
    const bases = await prisma.remitente.findMany();

    // 2. Ordenar por distancia al destino (cálculo simple euclidiano)
    const basesOrdenadas = bases.sort((a, b) => {
      const distA = Math.hypot(a.latitud_base - lat, a.longitud_base - lon);
      const distB = Math.hypot(b.latitud_base - lat, b.longitud_base - lon);
      return distA - distB;
    });

    // 3. Buscar la primera base con stock suficiente para todos los productos
    for (const base of basesOrdenadas) {
      const productosFaltantes = await this.verificarStockBase(
        base.id_remitente,
        input.productos,
      );

      if (productosFaltantes.length === 0) {
        // 4. Reservar en transacción ACID
        await this.reservarStock(base.id_remitente, input.productos);
        return { disponible: true, id_base: base.id_remitente };
      }
    }

    // Ninguna base tiene stock suficiente
    const todosLosFaltantes = input.productos.map((p) => p.productoId);
    return { disponible: false, productosFaltantes: todosLosFaltantes };
  }

  /**
   * CU-10/11: Libera la reserva cuando se cancela o anula una solicitud.
   */
  async liberarReserva(input: LiberarReservaInput): Promise<void> {
    await prisma.$transaction(
      input.productos.map((p) =>
        prisma.stock_Base.updateMany({
          where: {
            id_remitente: input.id_base,
            id_producto: p.productoId,
          },
          data: {
            cantidad_disponible: { increment: p.cantidad },
          },
        })
      )
    );
  }

  /**
   * CU-17: Consulta el stock disponible de una base, incluyendo el nombre
   * del producto. Devuelve TODOS los productos del catálogo, no solo los
   * que ya tienen una fila en Stock_Base: si la base nunca cargó stock de
   * un producto, aparece con cantidad_disponible: 0 (CU-17, excepción Caso A).
   */
  async consultarPorBase(id_base: string): Promise<StockItem[]> {
    const [productos, filasStock] = await Promise.all([
      prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
      prisma.stock_Base.findMany({ where: { id_remitente: id_base } }),
    ]);

    const stockPorProducto = new Map(filasStock.map((fila) => [fila.id_producto, fila]));

    return productos.map((producto) => {
      const fila = stockPorProducto.get(producto.id_producto);
      return {
        productoId: producto.id_producto,
        nombreProducto: producto.nombre,
        cantidad_disponible: fila?.cantidad_disponible ?? 0,
        cantidad_reservada: 0, // el schema actual no tiene cantidad_reservada
      };
    });
  }

  /**
   * CU-18: Fija la cantidad disponible de un producto en una base.
   * Si no existe el registro de Stock_Base para esa combinación
   * (ej. primera carga de stock), lo crea.
   */
  async actualizarCantidad(id_base: string, productoId: string, nuevaCantidad: number): Promise<void> {
    const existente = await prisma.stock_Base.findFirst({
      where: { id_remitente: id_base, id_producto: productoId },
    });

    if (existente) {
      await prisma.stock_Base.update({
        where: { id_stock: existente.id_stock },
        data: { cantidad_disponible: nuevaCantidad },
      });
    } else {
      await prisma.stock_Base.create({
        data: {
          id_remitente: id_base,
          id_producto: productoId,
          cantidad_disponible: nuevaCantidad,
        },
      });
    }
  }

  // ── Helpers privados ────────────────────────────────────────────────────

  private async verificarStockBase(
    id_base: string,
    productos: { productoId: string; cantidad: number }[],
  ): Promise<string[]> {
    const faltantes: string[] = [];

    for (const p of productos) {
      const stock = await prisma.stock_Base.findFirst({
        where: { id_remitente: id_base, id_producto: p.productoId },
      });

      if (!stock || stock.cantidad_disponible < p.cantidad) {
        faltantes.push(p.productoId);
      }
    }

    return faltantes;
  }

  private async reservarStock(
    id_base: string,
    productos: { productoId: string; cantidad: number }[],
  ): Promise<void> {
    await prisma.$transaction(
      productos.map((p) =>
        prisma.stock_Base.updateMany({
          where: {
            id_remitente: id_base,
            id_producto: p.productoId,
          },
          data: {
            cantidad_disponible: { decrement: p.cantidad },
          },
        })
      )
    );
  }
}