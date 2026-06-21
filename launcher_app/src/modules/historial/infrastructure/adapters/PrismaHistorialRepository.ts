import {
  ForManagingHistorial,
  RegistrarHistorialParams,
  HistorialEntry,
  PaginacionHistorial,
  FiltroHistorial,
  HistorialEntryConNombre,
} from "../../domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

const PAGE_SIZE_DEFAULT = 20;

function resolverNombreActor(usuario: { rol: string; nombre?: string | null; base?: { nombre?: string | null } | null }): string {
  if (usuario.rol === "REMITENTE") return usuario.base?.nombre ?? "Usuario sin nombre";
  return usuario.nombre ?? "Usuario sin nombre";
}

export class PrismaHistorialRepository implements ForManagingHistorial {
  async registrar(params: RegistrarHistorialParams): Promise<void> {
    await prisma.historial_Estado.create({
      data: {
        id_solicitud: params.solicitudId,
        id_usuario: params.actorId,
        est_ant: params.estadoAnterior ?? null,
        est_nue: params.estadoNuevo,
      },
    });
  }

  async listarPorSolicitud(solicitudId: string): Promise<HistorialEntry[]> {
    const rows = await prisma.historial_Estado.findMany({
      where: { id_solicitud: solicitudId },
      orderBy: { fecha_hora: "asc" },
    });

    return rows.map((row) => ({
      id: row.id_historial,
      solicitudId: row.id_solicitud,
      actorId: row.id_usuario,
      estadoAnterior: row.est_ant ? (row.est_ant as EstadoSolicitud) : undefined,
      estadoNuevo: row.est_nue as EstadoSolicitud,
      fechaHora: row.fecha_hora,
    }));
  }

  async listarGlobal(
    pagina: number,
    filtro?: FiltroHistorial,
    pageSize: number = PAGE_SIZE_DEFAULT,
  ): Promise<PaginacionHistorial> {
    const where = filtro?.estadoNuevo ? { est_nue: filtro.estadoNuevo } : undefined;

    const [entries, total] = await Promise.all([
      prisma.historial_Estado.findMany({
        where,
        orderBy: { fecha_hora: "desc" },
        take: pageSize,
        skip: (pagina - 1) * pageSize,
        select: {
          id_historial: true,
          id_solicitud: true,
          id_usuario: true,
          est_ant: true,
          est_nue: true,
          fecha_hora: true,
          solicitud: { select: { ubicacion_destino: true } },
          usuario: {
            include: { base: true },
          },
        },
      }),
      prisma.historial_Estado.count({ where }),
    ]);

    const data: HistorialEntryConNombre[] = entries.map((e) => {
      const ubicacion = JSON.parse(e.solicitud.ubicacion_destino) as { lat: number; lon: number };
      return {
        id: e.id_historial,
        solicitudId: e.id_solicitud,
        actorId: e.id_usuario,
        actorNombre: resolverNombreActor(e.usuario),
        estadoAnterior: e.est_ant ? (e.est_ant as EstadoSolicitud) : undefined,
        estadoNuevo: e.est_nue as EstadoSolicitud,
        fechaHora: e.fecha_hora,
        destino: { lat: ubicacion.lat, lon: ubicacion.lon },
      };
    });

    return {
      data,
      paginacion: { pagina, totalPaginas: Math.max(1, Math.ceil(total / pageSize)), total },
    };
  }
}
