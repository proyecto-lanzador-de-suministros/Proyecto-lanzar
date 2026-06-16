import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import { Solicitud } from "../../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaSolicitudesRepository implements ForManagingSolicitudes {
  
  async guardar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.upsert({
      where: { id_solicitud: solicitud.id_solicitud },
      update: { estado_actual: solicitud.estado },
      create: {
        id_solicitud: solicitud.id_solicitud,
        fecha_creacion: solicitud.fecha_solicitada,
        estado_actual: solicitud.estado,
        prioridad: solicitud.prioridad,
        latitud_destino: solicitud.ubicacion_destino.coordinates[1],
        longitud_destino: solicitud.ubicacion_destino.coordinates[0],
        id_solicitante: solicitud.id_solicitante,
        id_remitente: solicitud.id_remitente,
      }
    });
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    const row = await prisma.solicitud.findUnique({ where: { id_solicitud: id } });
    return row ? this.mapToDomain(row) : null;
  }

  async listarPorSolicitante(userId: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({ where: { id_solicitante: userId } });
    return rows.map((row: any) => this.mapToDomain(row));
  }

  async listarTodas(estadoFiltro?: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: estadoFiltro ? { estado_actual: estadoFiltro } : undefined,
      orderBy: { fecha_creacion: "desc" },
    });
    return rows.map((row: any) => this.mapToDomain(row));
  }

  // Helper para mapear Prisma -> Dominio
  private mapToDomain(row: any): Solicitud {
    return {
      id_solicitud: row.id_solicitud,
      fecha_solicitada: row.fecha_creacion,
      fecha_entrega: new Date(row.fecha_creacion.getTime() + 48 * 60 * 60 * 1000),
      estado: row.estado_actual as any,
      prioridad: row.prioridad as any,
      ubicacion_destino: {
        coordinates: [row.longitud_destino, row.latitud_destino],
      },
      id_solicitante: row.id_solicitante,
      id_remitente: row.id_remitente,
    };
  }
}