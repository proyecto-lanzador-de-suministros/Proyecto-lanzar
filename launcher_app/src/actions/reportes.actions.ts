"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/db/prisma.client";
import { EstadoSolicitud, PrioridadSolicitud } from "../modules/solicitudes/domain/entities/Solicitud";

interface RangoFechas {
  desde?: string; // ISO date (yyyy-mm-dd), inclusive
  hasta?: string; // ISO date (yyyy-mm-dd), inclusive
}

/**
 * Reporte de solicitudes en un rango de fechas: detalle fila por fila
 * (para exportar a CSV) + resumen agregado por estado y prioridad.
 * Admin-only. No hay caso de uso de dominio para "reportes" y no se
 * justifica crear uno solo para esta lectura agregada.
 */
export async function obtenerReporteSolicitudesAction(rango?: RangoFechas) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const desde = rango?.desde ? new Date(rango.desde) : undefined;
    // "hasta" se interpreta como fin de ese día, para incluirlo completo
    const hasta = rango?.hasta ? new Date(`${rango.hasta}T23:59:59.999`) : undefined;

    const solicitudes = await prisma.solicitud.findMany({
      where: {
        fecha_creacion: {
          ...(desde && { gte: desde }),
          ...(hasta && { lte: hasta }),
        },
      },
      orderBy: { fecha_creacion: "desc" },
      select: {
        id_solicitud: true,
        fecha_creacion: true,
        estado_actual: true,
        prioridad: true,
        remitente: { select: { nombre_base: true } },
      },
    });

    const filas = solicitudes.map((s) => ({
      id: s.id_solicitud,
      fechaCreacion: s.fecha_creacion.toISOString(),
      estado: s.estado_actual as EstadoSolicitud,
      prioridad: s.prioridad as PrioridadSolicitud,
      baseAsignada: s.remitente?.nombre_base ?? "Sin asignar",
    }));

    const porEstado: Record<string, number> = {};
    const porPrioridad: Record<string, number> = {};
    for (const f of filas) {
      porEstado[f.estado] = (porEstado[f.estado] ?? 0) + 1;
      porPrioridad[f.prioridad] = (porPrioridad[f.prioridad] ?? 0) + 1;
    }

    return {
      success: true,
      data: filas,
      resumen: { total: filas.length, porEstado, porPrioridad },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Reporte de stock actual (foto en el momento) por base y producto.
 */
export async function obtenerReporteStockAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const stock = await prisma.stock_Base.findMany({
      include: {
        remitente: { select: { nombre_base: true } },
        producto: { select: { nombre: true } },
      },
      orderBy: [{ remitente: { nombre_base: "asc" } }, { producto: { nombre: "asc" } }],
    });

    const data = stock.map((s) => ({
      id: s.id_stock,
      base: s.remitente.nombre_base,
      producto: s.producto.nombre,
      cantidadDisponible: s.cantidad_disponible,
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}