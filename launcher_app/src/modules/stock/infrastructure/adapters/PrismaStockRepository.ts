// ============================================================
// Adaptador: PrismaStockRepository
// Implementa ForManagingStock usando Prisma + PostgreSQL.
// Garantiza consistencia con transacciones ACID (ADR-002).
// ============================================================

import { ForManagingStock, VerificarYReservarInput, VerificarYReservarOutput, LiberarReservaInput } from "../../domain/ports/forManagingStock.port";
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
   * Consulta el stock disponible de una base para el remitente.
   */
  async consultarPorBase(id_base: string) {
    const rows = await prisma.stock_Base.findMany({
      where: { id_remitente: id_base },
      include: { producto: true },
    });

    return rows.map((row) => ({
      productoId: row.id_producto,
      cantidad_disponible: row.cantidad_disponible,
      cantidad_reservada: 0, // el schema actual no tiene cantidad_reservada
    }));
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