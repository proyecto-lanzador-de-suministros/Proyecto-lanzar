import {
  ForManagingNotificaciones,
  NotificacionEntry,
  PaginacionNotificaciones,
} from "../../domain/ports/forManagingNotificaciones.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

const PAGE_SIZE_DEFAULT = 20;

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

export class PrismaNotificacionesRepository implements ForManagingNotificaciones {
  async listarPorUsuario(usuarioId: string): Promise<NotificacionEntry[]> {
    const notificaciones = await prisma.notificacion.findMany({
      where: { id_usuario_destino: usuarioId },
      orderBy: { fecha_hora: "desc" },
    });

    return notificaciones.map((n) => ({
      id_notificacion: n.id_notificacion,
      mensaje: n.mensaje,
      fecha_hora: n.fecha_hora.toISOString(),
      id_solicitud: n.id_solicitud,
      id_usuario_destino: n.id_usuario_destino,
    }));
  }

  async listarGlobal(pagina: number, pageSize: number = PAGE_SIZE_DEFAULT): Promise<PaginacionNotificaciones> {
    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        orderBy: { fecha_hora: "desc" },
        take: pageSize,
        skip: (pagina - 1) * pageSize,
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
      destinatarioNombre: resolverNombreDestinatario(n.usuario_destino as DestinatarioRelaciones),
    }));

    return {
      data,
      paginacion: {
        pagina,
        totalPaginas: Math.max(1, Math.ceil(total / pageSize)),
        total,
      },
    };
  }
}
