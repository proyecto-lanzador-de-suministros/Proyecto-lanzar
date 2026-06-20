"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/db/prisma.client";

const PAGE_SIZE = 20;

interface DestinatarioRelaciones {
  remitente: { nombre_base: string } | null;
  administrador: { nombre: string } | null;
  solicitante: { nombre: string } | null;
}

function resolverNombreDestinatario(usuario: DestinatarioRelaciones): string {
  if (usuario.remitente) return usuario.remitente.nombre_base;
  if (usuario.administrador) return usuario.administrador.nombre;
  if (usuario.solicitante) return usuario.solicitante.nombre;
  return "Usuario sin nombre";
}

/**
 * Lista las notificaciones del usuario autenticado (las propias).
 * Usado por solicitante y remitente. Sin cambios.
 */
export async function obtenerNotificacionesAction() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { id_usuario_destino: userId },
      orderBy: { fecha_hora: "desc" },
    });

    return {
      success: true,
      data: notificaciones.map((n) => ({
        id_notificacion: n.id_notificacion,
        mensaje: n.mensaje,
        fecha_hora: n.fecha_hora.toISOString(),
        id_solicitud: n.id_solicitud,
        id_usuario_destino: n.id_usuario_destino,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lista TODAS las notificaciones enviadas en el sistema, sin filtrar por
 * destinatario. Pensado para que el admin audite qué comunicaciones recibió
 * cada usuario ante cada cambio de estado. Hoy ningún Notificar*.usecase.ts
 * apunta al admin como destinatario, así que esta es la única forma que
 * tiene el admin de ver el feed de notificaciones del sistema.
 */
export async function listarNotificacionesGlobalAction(params?: { pagina?: number }) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const pagina = Math.max(1, params?.pagina ?? 1);

    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        orderBy: { fecha_hora: "desc" },
        take: PAGE_SIZE,
        skip: (pagina - 1) * PAGE_SIZE,
        select: {
          id_notificacion: true,
          mensaje: true,
          fecha_hora: true,
          id_solicitud: true,
          id_usuario_destino: true,
          usuario_destino: {
            select: {
              remitente: { select: { nombre_base: true } },
              administrador: { select: { nombre: true } },
              solicitante: { select: { nombre: true } },
            },
          },
        },
      }),
      prisma.notificacion.count(),
    ]);

    const data = notificaciones.map((n) => ({
      id: n.id_notificacion,
      mensaje: n.mensaje,
      fechaHora: n.fecha_hora.toISOString(),
      solicitudId: n.id_solicitud,
      destinatarioId: n.id_usuario_destino,
      destinatarioNombre: resolverNombreDestinatario(n.usuario_destino),
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