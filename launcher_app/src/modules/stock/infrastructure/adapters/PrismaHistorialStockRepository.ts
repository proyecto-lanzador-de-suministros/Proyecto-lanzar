import {
  ForManagingHistorialStock,
  RegistrarHistorialStockParams,
  HistorialStockEntry,
} from "../../domain/ports/forManagingHistorialStock.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

interface ActorRelaciones {
  remitente: { nombre_base: string } | null;
  administrador: { nombre: string } | null;
  solicitante: { nombre: string } | null;
}

function resolverNombreActor(usuario: ActorRelaciones): string {
  if (usuario.remitente) return usuario.remitente.nombre_base;
  if (usuario.administrador) return usuario.administrador.nombre;
  if (usuario.solicitante) return usuario.solicitante.nombre;
  return "Usuario sin nombre";
}

export class PrismaHistorialStockRepository implements ForManagingHistorialStock {
  async registrar(params: RegistrarHistorialStockParams): Promise<void> {
    await prisma.historial_Stock.create({
      data: {
        id_remitente: params.id_remitente,
        id_producto: params.id_producto,
        cantidad_anterior: params.cantidadAnterior,
        cantidad_nueva: params.cantidadNueva,
        id_actor: params.actorId,
      },
    });
  }

  async listarPorBase(id_remitente: string): Promise<HistorialStockEntry[]> {
    const rows = await prisma.historial_Stock.findMany({
      where: { id_remitente },
      orderBy: { fecha_hora: "desc" },
      include: {
        producto: { select: { nombre: true } },
        actor: {
          select: {
            remitente: { select: { nombre_base: true } },
            administrador: { select: { nombre: true } },
            solicitante: { select: { nombre: true } },
          },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id_historial_stock,
      id_remitente: r.id_remitente,
      id_producto: r.id_producto,
      nombreProducto: r.producto.nombre,
      cantidadAnterior: r.cantidad_anterior,
      cantidadNueva: r.cantidad_nueva,
      actorId: r.id_actor,
      actorNombre: resolverNombreActor(r.actor as ActorRelaciones),
      fechaHora: r.fecha_hora,
    }));
  }
}