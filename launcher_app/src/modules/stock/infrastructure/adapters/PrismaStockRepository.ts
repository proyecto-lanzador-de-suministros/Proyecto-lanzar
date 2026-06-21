import { ForManagingStock, VerificarYReservarInput, VerificarYReservarOutput, LiberarReservaInput, StockItem } from "../../domain/ports/forManagingStock.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaStockRepository implements ForManagingStock {

  async verificarYReservar(input: VerificarYReservarInput): Promise<VerificarYReservarOutput> {
    const [lon, lat] = input.ubicacion_destino.coordinates;

    const bases = await prisma.base.findMany();

    const basesOrdenadas = bases.sort((a, b) => {
      const pa = JSON.parse(a.posicion_base) as { lat: number; lng: number };
      const pb = JSON.parse(b.posicion_base) as { lat: number; lng: number };
      const distA = Math.hypot(pa.lat - lat, pa.lng - lon);
      const distB = Math.hypot(pb.lat - lat, pb.lng - lon);
      return distA - distB;
    });

    for (const base of basesOrdenadas) {
      const productosFaltantes = await this.verificarStockBase(
        base.id_base,
        input.productos,
      );

      if (productosFaltantes.length === 0) {
        await this.reservarStock(base.id_base, input.productos);
        return { disponible: true, id_base: base.id_base };
      }
    }

    const todosLosFaltantes = input.productos.map((p) => p.productoId);
    return { disponible: false, productosFaltantes: todosLosFaltantes };
  }

  async liberarReserva(input: LiberarReservaInput): Promise<void> {
    await prisma.$transaction(
      input.productos.map((p) =>
        prisma.stock_Base.updateMany({
          where: {
            id_base: input.id_base,
            id_producto: p.productoId,
          },
          data: {
            cantidad_disponible: { increment: p.cantidad },
          },
        })
      )
    );
  }

  async consultarPorBase(id_base: string): Promise<StockItem[]> {
    const [productos, filasStock] = await Promise.all([
      prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
      prisma.stock_Base.findMany({ where: { id_base } }),
    ]);

    const stockPorProducto = new Map(filasStock.map((fila) => [fila.id_producto, fila]));

    return productos.map((producto) => {
      const fila = stockPorProducto.get(producto.id_producto);
      return {
        productoId: producto.id_producto,
        nombreProducto: producto.nombre,
        cantidad_disponible: fila?.cantidad_disponible ?? 0,
        cantidad_reservada: fila?.cantidad_reservada ?? 0,
      };
    });
  }

  async actualizarCantidad(id_base: string, productoId: string, nuevaCantidad: number): Promise<void> {
    const existente = await prisma.stock_Base.findFirst({
      where: { id_base, id_producto: productoId },
    });

    if (existente) {
      await prisma.stock_Base.update({
        where: { id_stock: existente.id_stock },
        data: { cantidad_disponible: nuevaCantidad },
      });
    } else {
      await prisma.stock_Base.create({
        data: {
          id_base,
          id_producto: productoId,
          cantidad_disponible: nuevaCantidad,
        },
      });
    }
  }

  private async verificarStockBase(
    id_base: string,
    productos: { productoId: string; cantidad: number }[],
  ): Promise<string[]> {
    const faltantes: string[] = [];

    for (const p of productos) {
      const stock = await prisma.stock_Base.findFirst({
        where: { id_base, id_producto: p.productoId },
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
            id_base,
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
