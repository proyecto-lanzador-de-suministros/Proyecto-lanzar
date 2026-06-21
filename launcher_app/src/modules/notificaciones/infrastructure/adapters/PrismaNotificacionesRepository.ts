import {
  ForManagingNotificaciones,
  NotificacionEntry,
  PaginacionNotificaciones,
} from "../../domain/ports/forManagingNotificaciones.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

const PAGE_SIZE_DEFAULT = 20;

function resolverNombreDestinatario(usuario: { rol: string; nombre?: string | null; base?: { nombre?: string | null } | null }): string {
  if (usuario.rol === "REMITENTE") return usuario.base?.nombre ?? "Usuario sin nombre";
  return usuario.nombre ?? "Usuario sin nombre";
}

export class PrismaNotificacionesRepository implements ForManagingNotificaciones {
  async listarPorUsuario(usuarioId: string): Promise<NotificacionEntry[]> {
    const notificaciones = await prisma.notificacion.findMany({
      where: { id_usuario: usuarioId },
      orderBy: { fecha: "desc" },
    });

    return notificaciones.map((n) => ({
      id_notificacion: n.id_notificacion,
      mensaje: n.mensaje,
      leida: n.leida,
      fecha_hora: n.fecha.toISOString(),
      id_solicitud: n.id_solicitud,
      id_usuario_destino: n.id_usuario,
    }));
  }

  async listarGlobal(pagina: number, pageSize: number = PAGE_SIZE_DEFAULT): Promise<PaginacionNotificaciones> {
    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        orderBy: { fecha: "desc" },
        take: pageSize,
        skip: (pagina - 1) * pageSize,
        select: {
          id_notificacion: true,
          mensaje: true,
          leida: true,
          fecha: true,
          id_solicitud: true,
          id_usuario: true,
          usuario: {
            include: { base: true },
          },
        },
      }),
      prisma.notificacion.count(),
    ]);

    const data = notificaciones.map((n) => ({
      id: n.id_notificacion,
      mensaje: n.mensaje,
      leida: n.leida,
      fechaHora: n.fecha.toISOString(),
      solicitudId: n.id_solicitud,
      destinatarioId: n.id_usuario,
      destinatarioNombre: resolverNombreDestinatario(n.usuario),
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
