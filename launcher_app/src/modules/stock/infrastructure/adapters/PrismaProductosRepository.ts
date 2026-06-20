import { ForManagingProductos, CatalogoProducto, BaseParaStock } from "../../domain/ports/forManagingProductos.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaProductosRepository implements ForManagingProductos {
  async listarCatalogo(): Promise<CatalogoProducto[]> {
    const productos = await prisma.producto.findMany({
      select: { id_producto: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return productos.map((p) => ({
      id_producto: p.id_producto,
      nombre: p.nombre,
    }));
  }

  async listarBases(): Promise<BaseParaStock[]> {
    const remitentes = await prisma.remitente.findMany({
      select: { id_remitente: true, nombre_base: true },
      orderBy: { nombre_base: "asc" },
    });

    return remitentes.map((r) => ({
      id: r.id_remitente,
      nombre: r.nombre_base,
    }));
  }

  async buscarProductoPorIdentificador(identificador: string): Promise<CatalogoProducto | null> {
    const producto = await prisma.producto.findFirst({
      where: {
        OR: [
          { id_producto: identificador },
          { nombre: identificador },
        ],
      },
      select: { id_producto: true, nombre: true },
    });

    if (!producto) return null;

    return {
      id_producto: producto.id_producto,
      nombre: producto.nombre,
    };
  }
}
