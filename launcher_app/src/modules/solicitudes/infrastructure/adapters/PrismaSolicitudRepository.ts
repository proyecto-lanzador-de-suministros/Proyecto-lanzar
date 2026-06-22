import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import {
  Solicitud,
  EstadoSolicitud,
  PrioridadSolicitud,
} from "../../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { Prisma } from "../../../../generated/prisma";

type SolicitudConDetalles = Prisma.SolicitudGetPayload<{
  include: { detalles: true };
}>;

export class PrismaSolicitudesRepository implements ForManagingSolicitudes {
  async guardar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.create({
      data: {
        id_solicitud: solicitud.id_solicitud,
        estado: solicitud.estado,
        prioridad: solicitud.prioridad,
        ubicacion_destino: JSON.stringify({
          lat: solicitud.ubicacion_destino.coordinates[1],
          lon: solicitud.ubicacion_destino.coordinates[0],
        }),
        id_usuario: solicitud.id_usuario,
        id_base: solicitud.id_base ?? null,
      },
    });
  }

  async actualizar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.update({
      where: { id_solicitud: solicitud.id_solicitud },
      data: {
        estado: solicitud.estado,
        prioridad: solicitud.prioridad,
        ubicacion_destino: JSON.stringify({
          lat: solicitud.ubicacion_destino.coordinates[1],
          lon: solicitud.ubicacion_destino.coordinates[0],
        }),
        id_usuario: solicitud.id_usuario,
        id_base: solicitud.id_base ?? null,
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
      where: { id_usuario: userId },
      include: { detalles: true },
      orderBy: { fecha_solicitada: "desc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async listarTodas(estadoFiltro?: string): Promise<Solicitud[]> {
    //console.log("listar todas:");
    const rows = await prisma.solicitud.findMany({
      where: estadoFiltro ? { estado: estadoFiltro } : undefined,
      include: { detalles: true },
      orderBy: { fecha_solicitada: "desc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async listarPorBase(id_base: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { id_base },
      include: { detalles: true },
      orderBy: { fecha_solicitada: "desc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async listarPendientes(id_base: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { id_base, estado: EstadoSolicitud.Asignada },
      include: { detalles: true },
      orderBy: { fecha_solicitada: "asc" },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async actualizarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    extras?: {
      motivoCancelacion?: string;
      motivoAnulacion?: string;
      id_base?: string;
      fecha_entrega?: Date;
    },
  ): Promise<void> {
    await prisma.solicitud.update({
      where: { id_solicitud: id },
      data: {
        estado: nuevoEstado,
        ...(extras?.id_base !== undefined && { id_base: extras.id_base }),
        ...(extras?.motivoCancelacion !== undefined && {
          motivo_cancelacion: extras.motivoCancelacion,
        }),
        ...(extras?.motivoAnulacion !== undefined && {
          motivo_anulacion: extras.motivoAnulacion,
        }),
        ...(extras?.cantidad_cajas !== undefined && {
          cantidad_cajas: extras.cantidad_cajas,
        }),
      },
    });
  }

  private mapToDomain(row: SolicitudConDetalles): Solicitud {
    //console.log(row);
    const ubicacion = row.ubicacion_destino
      ? (JSON.parse(row.ubicacion_destino) as { lat: number; lon: number })
      : { lat: 0, lon: 0 };
    return Solicitud.reconstruir({
      id_solicitud: row.id_solicitud,
      id_usuario: row.id_usuario,
      id_base: row.id_base ?? undefined,
      ubicacion_destino: {
        type: "Point",
        coordinates: [ubicacion.lon, ubicacion.lat],
      },
      prioridad: row.prioridad as PrioridadSolicitud,
      productos: (row.detalles ?? []).map((d) => ({
        productoId: d.id_producto,
        cantidad: d.cantidad_solicitada,
      })),
      estado: row.estado as EstadoSolicitud,
      fecha_solicitada: row.fecha_solicitada,
      fechaActualizacion: row.fecha_solicitada,
      motivoCancelacion: row.motivo_cancelacion ?? undefined,
      motivoAnulacion: row.motivo_anulacion ?? undefined,
      cantidad_cajas: row.cantidad_cajas ?? undefined,
    });
  }
}
