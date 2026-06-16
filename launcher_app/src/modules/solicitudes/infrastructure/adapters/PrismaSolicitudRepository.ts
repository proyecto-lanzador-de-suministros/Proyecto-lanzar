import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud, PrioridadSolicitud } from "../../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaSolicitudesRepository implements ForManagingSolicitudes {
  
  async guardar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.upsert({
      where: { id_solicitud: solicitud.id },
      update: { 
        estado_actual: solicitud.estado,
        id_remitente: solicitud.remitenteId || null,
      },
      create: {
        id_solicitud: solicitud.id,
        fecha_creacion: solicitud.fechaCreacion,
        estado_actual: solicitud.estado,
        prioridad: solicitud.prioridad,
        latitud_destino: solicitud.latDestino,
        longitud_destino: solicitud.lonDestino,
        id_solicitante: solicitud.solicitanteId,
        id_remitente: solicitud.remitenteId || null,
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
    return Solicitud.reconstruir({
      id: row.id_solicitud,
      solicitanteId: row.id_solicitante,
      latDestino: row.latitud_destino,
      lonDestino: row.longitud_destino,
      prioridad: row.prioridad as PrioridadSolicitud,
      productos: [], // Temporalmente vacío hasta implementar Detalle_Solicitud en Prisma
      estado: row.estado_actual as EstadoSolicitud,
      remitenteId: row.id_remitente || undefined,
      fechaCreacion: row.fecha_creacion,
      fechaActualizacion: row.fecha_creacion
    });
  }
}