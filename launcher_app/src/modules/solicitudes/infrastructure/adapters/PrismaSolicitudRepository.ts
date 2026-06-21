// ============================================================
// Adaptador: PrismaSolicitudesRepository
// Traduce entre el modelo Prisma y la entidad de dominio.
// ============================================================

import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import {
  Solicitud,
  EstadoSolicitud,
  PrioridadSolicitud,
} from "../../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

import { Prisma } from "../../../../generated/prisma";

// El tipo de una solicitud con detalles incluidos:
type SolicitudConDetalles = Prisma.SolicitudGetPayload<{
  include: { detalles: true };
}>;

export class PrismaSolicitudesRepository implements ForManagingSolicitudes {
  async guardar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.create({
      data: {
        id_solicitud: solicitud.id_solicitud,
        estado_actual: solicitud.estado,
        prioridad: solicitud.prioridad,
        latitud_destino: solicitud.ubicacion_destino.coordinates[1],
        longitud_destino: solicitud.ubicacion_destino.coordinates[0],
        id_solicitante: solicitud.id_usuario,
        id_remitente: solicitud.id_remitente ?? null,
        // fecha_creacion la pone Prisma con @default(now())
      },
    });
  }

  async actualizar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.update({
      where: { id_solicitud: solicitud.id_solicitud },
      data: {
        estado_actual: solicitud.estado,
        prioridad: solicitud.prioridad,
        latitud_destino: solicitud.ubicacion_destino.coordinates[1],
        longitud_destino: solicitud.ubicacion_destino.coordinates[0],
        id_solicitante: solicitud.id_usuario,
        id_remitente: solicitud.id_remitente ?? null,
        motivo_cancelacion: solicitud.motivoCancelacion ?? null,
        motivo_anulacion: solicitud.motivoAnulacion ?? null,
      },
    });
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    const row = await prisma.solicitud.findUnique({
      where: { id_solicitud: id },
      include: { detalles: true },
    });
    return row ? this.mapToDomain(row) : null;
  }

  async listarPorSolicitante(userId: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { id_solicitante: userId },
      include: { detalles: true },
      orderBy: { fecha_creacion: "desc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async listarTodas(estadoFiltro?: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: estadoFiltro ? { estado_actual: estadoFiltro } : undefined,
      include: { detalles: true },
      orderBy: { fecha_creacion: "desc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async listarPorBase(id_base: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { id_remitente: id_base },
      include: { detalles: true },
      orderBy: { fecha_creacion: "desc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async listarPendientes(id_base: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { id_remitente: id_base, estado_actual: EstadoSolicitud.Asignada },
      include: { detalles: true },
      orderBy: { fecha_creacion: "asc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async actualizarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    extras?: {
      motivoCancelacion?: string;
      motivoAnulacion?: string;
      id_remitente?: string;
      fecha_entrega?: Date;
    },
  ): Promise<void> {
    await prisma.solicitud.update({
      where: { id_solicitud: id },
      data: {
        estado_actual: nuevoEstado,
        ...(extras?.id_remitente !== undefined && { id_remitente: extras.id_remitente }),
        ...(extras?.motivoCancelacion !== undefined && {
          motivo_cancelacion: extras.motivoCancelacion,
        }),
        ...(extras?.motivoAnulacion !== undefined && {
          motivo_anulacion: extras.motivoAnulacion,
        }),
      },
    });
  }

  // ── Mapper Prisma → Dominio ─────────────────────────────────────────────
  private mapToDomain(row: SolicitudConDetalles): Solicitud {
    return Solicitud.reconstruir({
      id_solicitud: row.id_solicitud,
      id_usuario: row.id_solicitante,
      id_remitente: row.id_remitente ?? undefined,
      ubicacion_destino: {
        type: "Point",
        coordinates: [row.longitud_destino, row.latitud_destino],
      },
      prioridad: row.prioridad as PrioridadSolicitud,
      productos: (row.detalles ?? []).map((d) => ({
        productoId: d.id_producto,
        cantidad: d.cantidad_pedida,
      })),
      estado: row.estado_actual as EstadoSolicitud,
      fecha_solicitada: row.fecha_creacion,
      fechaActualizacion: row.fecha_creacion,
      motivoCancelacion: row.motivo_cancelacion ?? undefined,
      motivoAnulacion: row.motivo_anulacion ?? undefined,
    });
  }
}
