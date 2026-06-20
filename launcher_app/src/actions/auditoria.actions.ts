"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/db/prisma.client";
import { EstadoSolicitud } from "../modules/solicitudes/domain/entities/Solicitud";

const PAGE_SIZE = 20;

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

/**
 * Lista el historial de cambios de estado de TODAS las solicitudes,
 * paginado y con filtro opcional por estado nuevo (CU-20, vista global
 * para el admin). El puerto de dominio ForManagingHistorial solo soporta
 * listarPorSolicitud(id) — ampliar el dominio para esta vista admin-only
 * no se justifica, así que esta consulta va directa por Prisma, igual
 * que stock.actions.ts y remitentes.actions.ts.
 */
export async function listarAuditoriaAction(params?: {
  pagina?: number;
  estadoNuevo?: EstadoSolicitud;
}) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const pagina = Math.max(1, params?.pagina ?? 1);
    const where = params?.estadoNuevo ? { estado_nuevo: params.estadoNuevo } : undefined;

    const [entries, total] = await Promise.all([
      prisma.historial_Estado.findMany({
        where,
        orderBy: { fecha_hora: "desc" },
        take: PAGE_SIZE,
        skip: (pagina - 1) * PAGE_SIZE,
        select: {
          id_historial: true,
          id_solicitud: true,
          id_usuario: true,
          estado_anterior: true,
          estado_nuevo: true,
          fecha_hora: true,
          solicitud: {
            select: { latitud_destino: true, longitud_destino: true },
          },
          usuario: {
            select: {
              remitente: { select: { nombre_base: true } },
              administrador: { select: { nombre: true } },
              solicitante: { select: { nombre: true } },
            },
          },
        },
      }),
      prisma.historial_Estado.count({ where }),
    ]);

    const data = entries.map((e) => ({
      id: e.id_historial,
      solicitudId: e.id_solicitud,
      destino: {
        lat: e.solicitud.latitud_destino,
        lon: e.solicitud.longitud_destino,
      },
      actorId: e.id_usuario,
      actorNombre: resolverNombreActor(e.usuario),
      estadoAnterior: e.estado_anterior as EstadoSolicitud,
      estadoNuevo: e.estado_nuevo as EstadoSolicitud,
      fechaHora: e.fecha_hora.toISOString(),
    }));

    return {
      success: true,
      data,
      paginacion: {
        pagina,
        totalPaginas: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}