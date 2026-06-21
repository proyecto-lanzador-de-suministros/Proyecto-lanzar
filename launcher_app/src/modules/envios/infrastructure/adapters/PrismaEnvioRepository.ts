import { ForManagingEnvios, Envio, Contenedor, CrearContenedorInput } from "../../domain/ports/forManagingEnvios.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaEnvioRepository implements ForManagingEnvios {
  async listarTodos(): Promise<Envio[]> {
    const rows = await prisma.envio.findMany({
      include: { base: true, solicitud: true },
      orderBy: { fecha_hora: "desc" },
    });
    return rows.map((row) => ({
      id_envio: row.id_envio,
      id_solicitud: row.id_solicitud,
      id_base: row.id_base,
      fecha_hora_programada: row.fecha_hora,
      estado_envio: row.estado_envio,
      matricula_avion: row.matricula_avion,
      piloto: row.piloto,
    }));
  }

  async crear(envio: Omit<Envio, "id_envio">): Promise<Envio> {
    const row = await prisma.envio.create({
      data: {
        id_solicitud: envio.id_solicitud,
        id_base: envio.id_base,
        fecha_hora: envio.fecha_hora_programada,
        estado_envio: envio.estado_envio,
        matricula_avion: envio.matricula_avion,
        piloto: envio.piloto,
      },
    });
    return {
      id_envio: row.id_envio,
      id_solicitud: row.id_solicitud,
      id_base: row.id_base,
      fecha_hora_programada: row.fecha_hora,
      estado_envio: row.estado_envio,
      matricula_avion: row.matricula_avion,
      piloto: row.piloto,
    };
  }

  async buscarPorId(id: string): Promise<Envio | null> {
    const row = await prisma.envio.findUnique({ where: { id_envio: id } });
    if (!row) return null;
    return {
      id_envio: row.id_envio,
      id_solicitud: row.id_solicitud,
      id_base: row.id_base,
      fecha_hora_programada: row.fecha_hora,
      estado_envio: row.estado_envio,
      matricula_avion: row.matricula_avion,
      piloto: row.piloto,
    };
  }

  async asignarContenedor(id_envio: string, contenedor: CrearContenedorInput): Promise<Contenedor> {
    const row = await prisma.contenedor.create({
      data: {
        id_envio: id_envio,
        tipo_paracaidas: contenedor.tipo_paracaidas,
        peso_maximo: contenedor.peso_maximo,
        estado_mecanico: contenedor.estado_mecanico,
      },
    });
    return {
      id_contenedor: row.id_contenedor,
      tipo_paracaidas: row.tipo_paracaidas,
      peso_maximo: row.peso_maximo,
      estado_mecanico: row.estado_mecanico,
      id_envio: row.id_envio,
    };
  }
}
