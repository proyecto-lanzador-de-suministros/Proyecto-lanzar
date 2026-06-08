// Adaptador driven. Implementa forManagingSolicitudes usando Prisma como ORM contra la base de datos PostgreSQL.
// src/modules/solicitudes/infrastructure/adapters/PrismaSolicitudesRepository.ts
import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import { Solicitud } from "../../domain/entities/Solicitud";
import { prisma } from "@/infrastructure/db/prisma.client";

export class PrismaSolicitudesRepository implements ForManagingSolicitudes {
  async guardar(solicitud: Solicitud): Promise<void> {
    await prisma.solicitud.upsert({
      where: { id: solicitud.id },
      update: { estado: solicitud.estado },
      create: {
        id: solicitud.id,
        remitenteId: solicitud.remitente,
        solicitanteId: solicitud.solicitante,
        descripcion: solicitud.descripcion,
        estado: solicitud.estado,
        creadaEn: solicitud.creadaEn,
      },
    });
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    const row = await prisma.solicitud.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row); // ← traducción
  }

  async listarPorSolicitante(userId: string): Promise<Solicitud[]> {
    const rows = await prisma.solicitud.findMany({
      where: { solicitanteId: userId },
    });
    return rows.map(this.toDomain);
  }

  // Método privado de traducción: Prisma → dominio
  private toDomain(row: any): Solicitud {
    return {
      id: row.id,
      remitente: row.remitenteId,
      solicitante: row.solicitanteId,
      descripcion: row.descripcion,
      estado: row.estado,
      creadaEn: row.creadaEn,
    };
  }
}
