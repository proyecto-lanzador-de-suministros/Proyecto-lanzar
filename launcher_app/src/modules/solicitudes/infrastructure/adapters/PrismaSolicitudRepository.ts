import type { PuntoGeometria } from "@/src/types/geometria";
import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import { Solicitud } from "../../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import {
  InputJsonObject,
  JsonValue,
} from "@/src/generated/prisma/runtime/client";

export class PrismaSolicitudesRepository implements ForManagingSolicitudes {
  async guardar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.upsert({
      where: { id: solicitud.id_solicitud },
      update: { estado: solicitud.estado },
      create: {
        id: solicitud.id_solicitud,
        baseId: solicitud.id_base,
        usuarioId: solicitud.id_usuario,
        fechaSolicitada: solicitud.fecha_solicitada,
        estado: solicitud.estado,
        prioridad: solicitud.prioridad,
        ubicacionDestino:
          solicitud.ubicacion_destino as unknown as InputJsonObject,
        fechaEntrega: solicitud.fecha_entrega,
        fechaEstimada: solicitud.fecha_estimada,
      },
    });
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    const row = await prisma.solicitud.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async listarPorSolicitante(userId: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { usuarioId: userId },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async listarTodas(estadoFiltro?: string): Promise<Solicitud[]> {
    const whereClause = estadoFiltro ? { estado: estadoFiltro } : {};

    const rows = await prisma.solicitud.findMany({
      where: whereClause,
      orderBy: { fechaSolicitada: "desc" },
    });

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: {
    id: string;
    baseId: string;
    usuarioId: string;
    fechaSolicitada: Date;
    estado: string;
    prioridad: string;
    ubicacionDestino: JsonValue;
    fechaEntrega: Date;
    fechaEstimada: Date;
  }): Solicitud {
    return {
      id_solicitud: row.id,
      id_base: row.baseId,
      id_usuario: row.usuarioId,
      fecha_solicitada: row.fechaSolicitada,
      estado: row.estado as Solicitud["estado"],
      prioridad: row.prioridad as Solicitud["prioridad"],
      ubicacion_destino: row.ubicacionDestino as unknown as PuntoGeometria,
      fecha_entrega: row.fechaEntrega,
      fecha_estimada: row.fechaEstimada,
    };
  }
}
