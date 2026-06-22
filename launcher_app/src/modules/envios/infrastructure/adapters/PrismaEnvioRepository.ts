import { ForManagingEnvios, Envio, Contenedor, CrearContenedorInput, DatosTrayectoria } from "../../domain/ports/forManagingEnvios.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaEnvioRepository implements ForManagingEnvios {
  private mapRow(row: any): Envio {
    return {
      id_envio: row.id_envio,
      id_solicitud: row.id_solicitud,
      id_base: row.id_base,
      fecha_hora_programada: row.fecha_hora,
      estado_envio: row.estado_envio,
      datos_trayectoria: row.datos_clima ? (row.datos_clima as unknown as DatosTrayectoria) : undefined,
    };
  }

  async listarTodos(): Promise<Envio[]> {
    const rows = await prisma.envio.findMany({
      include: { base: true, solicitud: true },
      orderBy: { fecha_hora: "desc" },
    });
    return rows.map((row) => this.mapRow(row));
  }

  async crear(envio: Omit<Envio, "id_envio">): Promise<Envio> {
    const row = await prisma.envio.create({
      data: {
        id_solicitud: envio.id_solicitud,
        id_base: envio.id_base,
        fecha_hora: envio.fecha_hora_programada,
        estado_envio: envio.estado_envio,
        datos_clima: envio.datos_trayectoria as any ?? undefined,
      },
    });
    return this.mapRow(row);
  }

  async buscarPorId(id: string): Promise<Envio | null> {
    const row = await prisma.envio.findUnique({ where: { id_envio: id } });
    if (!row) return null;
    return this.mapRow(row);
  }

  async buscarPorIdSolicitud(id_solicitud: string): Promise<Envio | null> {
    const row = await prisma.envio.findFirst({ where: { id_solicitud } });
    if (!row) return null;
    return this.mapRow(row);
  }

  async asignarContenedor(id_envio: string, contenedor: CrearContenedorInput): Promise<Contenedor> {
    const row = await prisma.contenedor.create({
      data: {
        id_envio: id_envio,
        tipo_paracaidas: contenedor.tipo_paracaidas,
        peso_max: contenedor.peso_max,
      },
    });
    return {
      id_contenedor: row.id_contenedor,
      tipo_paracaidas: row.tipo_paracaidas,
      peso_max: row.peso_max,
      id_envio: row.id_envio,
    };
  }

  async guardarDatosTrayectoria(id_envio: string, datos: DatosTrayectoria): Promise<void> {
    await prisma.envio.update({
      where: { id_envio },
      data: { datos_clima: datos as any },
    });
  }
}
