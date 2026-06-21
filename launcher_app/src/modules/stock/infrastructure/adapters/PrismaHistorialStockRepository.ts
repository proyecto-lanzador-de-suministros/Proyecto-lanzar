import {
  ForManagingHistorialStock,
  RegistrarHistorialStockParams,
  HistorialStockEntry,
} from "../../domain/ports/forManagingHistorialStock.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

function resolverNombreActor(usuario: { rol: string; nombre?: string | null; base?: { nombre?: string | null } | null }): string {
  if (usuario.rol === "REMITENTE") return usuario.base?.nombre ?? "Usuario sin nombre";
  return usuario.nombre ?? "Usuario sin nombre";
}

export class PrismaHistorialStockRepository implements ForManagingHistorialStock {
  async registrar(params: RegistrarHistorialStockParams): Promise<void> {
    await prisma.historial_Stock.create({
      data: {
        id_base: params.id_base,
        id_producto: params.id_producto,
        cantidad_anterior: params.cantidadAnterior,
        cantidad_nueva: params.cantidadNueva,
        id_actor: params.actorId,
      },
    });
  }

  async listarPorBase(id_base: string): Promise<HistorialStockEntry[]> {
    const rows = await prisma.historial_Stock.findMany({
      where: { id_base },
      orderBy: { fecha_hora: "desc" },
      include: {
        producto: { select: { nombre: true } },
        actor: {
          include: { base: true },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id_historial_stock,
      id_base: r.id_base,
      id_producto: r.id_producto,
      nombreProducto: r.producto.nombre,
      cantidadAnterior: r.cantidad_anterior,
      cantidadNueva: r.cantidad_nueva,
      actorId: r.id_actor,
      actorNombre: resolverNombreActor(r.actor),
      fechaHora: r.fecha_hora,
    }));
  }
}
