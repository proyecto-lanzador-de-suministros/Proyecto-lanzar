import { ForManagingProductos, CatalogoProducto, BaseParaStock } from "../../domain/ports/forManagingProductos.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaProductosRepository implements ForManagingProductos {
  async listarCatalogo(): Promise<CatalogoProducto[]> {
    const productos = await prisma.producto.findMany({
      select: { id_producto: true, nombre: true, descripcion: true, peso_unitario: true },
      orderBy: { nombre: "asc" },
    });

    return productos.map((p) => ({
      id_producto: p.id_producto,
      nombre: p.nombre,
      descripcion: p.descripcion,
      peso_unitario: p.peso_unitario,
    }));
  }

  async listarBases(): Promise<BaseParaStock[]> {
    const bases = await prisma.base.findMany({
      select: { id_base: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return bases.map((b) => ({
      id: b.id_base,
      nombre: b.nombre,
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
      select: { id_producto: true, nombre: true, descripcion: true, peso_unitario: true },
    });

    if (!producto) return null;

    return {
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      peso_unitario: producto.peso_unitario,
    };
  }
}
