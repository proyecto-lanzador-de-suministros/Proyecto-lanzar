import { ForManagingHistorial, RegistrarHistorialParams, HistorialEntry } from "../../domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

/**
 * Adaptador driven. Implementa ForManagingHistorial usando Prisma
 * para leer y escribir en la tabla Historial_Estado de PostgreSQL.
 */
export class PrismaHistorialRepository implements ForManagingHistorial {
  async registrar(params: RegistrarHistorialParams): Promise<void> {
    await prisma.historial_Estado.create({
      data: {
        id_solicitud: params.solicitudId,
        id_usuario: params.actorId,
        estado_anterior: params.estadoAnterior,
        estado_nuevo: params.estadoNuevo,
        // fecha_hora usa el default NOW() definido en el schema de Prisma
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
      estadoAnterior: row.estado_anterior as EstadoSolicitud,
      estadoNuevo: row.estado_nuevo as EstadoSolicitud,
      fechaHora: row.fecha_hora,
    }));
  }
}