import { ForManagingHistorial, RegistrarHistorialParams } from "../../domain/ports/forManagingHistorial.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

/**
 * Adaptador driven. Implementa ForManagingHistorial usando Prisma
 * para escribir en la tabla Historial_Estado de PostgreSQL.
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
}