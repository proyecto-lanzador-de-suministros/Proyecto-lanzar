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

interface ActorRelaciones {
  remitente: { base: { nombre: string } } | null;
  administrador: { nombre: string } | null;
  solicitante: { nombre: string } | null;
}

function resolverNombreActor(usuario: ActorRelaciones): string {
  if (usuario.remitente) return usuario.remitente.base.nombre;
  if (usuario.administrador) return usuario.administrador.nombre;
  if (usuario.solicitante) return usuario.solicitante.nombre;
  return "Usuario sin nombre";
}

export class PrismaHistorialRepository implements ForManagingHistorial {
  async registrar(params: RegistrarHistorialParams): Promise<void> {
    await prisma.historial_Estado.create({
      data: {
        id_solicitud: params.solicitudId,
        id_usuario: params.actorId,
        estado_anterior: params.estadoAnterior ?? null,
        estado_nuevo: params.estadoNuevo,
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
      estadoAnterior: row.estado_anterior ? (row.estado_anterior as EstadoSolicitud) : undefined,
      estadoNuevo: row.estado_nuevo as EstadoSolicitud,
      fechaHora: row.fecha_hora,
    }));
  }

  async listarGlobal(
    pagina: number,
    filtro?: FiltroHistorial,
    pageSize: number = PAGE_SIZE_DEFAULT,
  ): Promise<PaginacionHistorial> {
    const where = filtro?.estadoNuevo ? { estado_nuevo: filtro.estadoNuevo } : undefined;

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
          estado_anterior: true,
          estado_nuevo: true,
          fecha_hora: true,
          solicitud: { select: { latitud_destino: true, longitud_destino: true } },
          usuario: {
            select: {
              remitente: { select: { base: { select: { nombre: true } } } },
              administrador: { select: { nombre: true } },
              solicitante: { select: { nombre: true } },
            },
          },
        },
      }),
      prisma.historial_Estado.count({ where }),
    ]);

    const data: HistorialEntryConNombre[] = entries.map((e) => ({
      id: e.id_historial,
      solicitudId: e.id_solicitud,
      actorId: e.id_usuario,
      actorNombre: resolverNombreActor(e.usuario as ActorRelaciones),
      estadoAnterior: e.estado_anterior ? (e.estado_anterior as EstadoSolicitud) : undefined,
      estadoNuevo: e.estado_nuevo as EstadoSolicitud,
      fechaHora: e.fecha_hora,
      destino: { lat: e.solicitud.latitud_destino, lon: e.solicitud.longitud_destino },
    }));

    return {
      data,
      paginacion: { pagina, totalPaginas: Math.max(1, Math.ceil(total / pageSize)), total },
    };
  }
}