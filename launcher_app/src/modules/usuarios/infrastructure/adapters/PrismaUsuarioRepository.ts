import { ForManagingUsuarios, BaseRemitenteData, ActualizarBaseRemitenteInput, CrearBaseRemitenteInput, DatosPerfilInput } from "../../domain/ports/forManagingUsuarios.port";
import { Usuario, EstadoCuenta, RolUsuario } from "../../domain/entities/Usuario";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaUsuarioRepository implements ForManagingUsuarios {
  async buscarPorId(id: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { base: true }
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listarPendientes(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({
      where: { estado_cuenta: "PENDIENTE" },
      include: { base: true }
    });
    return rows.map(row => this.mapToDomain(row));
  }

  async listarTodos(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({
      include: { base: true },
      orderBy: { estado_cuenta: "asc" }
    });
    return rows.map(row => this.mapToDomain(row));
  }

  async guardar(usuario: Usuario): Promise<void> {
    await prisma.usuario.update({
      where: { id_usuario: usuario.id },
      data: { estado_cuenta: usuario.estadoCuenta }
    });
  }

  async eliminar(id: string): Promise<void> {
    await prisma.usuario.delete({
      where: { id_usuario: id }
    });
  }

  async listarBasesRemitentes(): Promise<BaseRemitenteData[]> {
    const rows = await prisma.usuario.findMany({
      where: { rol: "REMITENTE" },
      include: { base: true },
      orderBy: { base: { nombre: "asc" } },
    });

    return rows.map((r) => {
      const posicion = r.base
        ? JSON.parse(r.base.posicion_base) as { lat: number; lng: number }
        : { lat: 0, lng: 0 };
      return {
        id_remitente: r.id_usuario,
        id_base: r.id_base ?? "",
        nombre: r.base?.nombre ?? "",
        latitud: posicion.lat,
        longitud: posicion.lng,
        capacidad_pista: "",
        estado_cuenta: r.estado_cuenta,
        configuracionPendiente: posicion.lat === 0 && posicion.lng === 0,
      };
    });
  }

  async actualizarBaseRemitente(id: string, datos: ActualizarBaseRemitenteInput): Promise<void> {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_base: true },
    });
    if (!usuario?.id_base) return;

    const updateData: Record<string, unknown> = {};
    if (datos.nombre !== undefined) updateData.nombre = datos.nombre;

    if (datos.latitud !== undefined || datos.longitud !== undefined) {
      const base = await prisma.base.findUnique({
        where: { id_base: usuario.id_base },
        select: { posicion_base: true },
      });
      const current = base
        ? JSON.parse(base.posicion_base) as { lat: number; lng: number }
        : { lat: 0, lng: 0 };
      updateData.posicion_base = JSON.stringify({
        lat: datos.latitud ?? current.lat,
        lng: datos.longitud ?? current.lng,
      });
    }

    await prisma.base.update({
      where: { id_base: usuario.id_base },
      data: updateData,
    });
  }

  async obtenerBaseDeRemitente(remitenteId: string): Promise<string | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: remitenteId },
      select: { id_base: true },
    });
    return usuario?.id_base ?? null;
  }

  async baseExiste(id: string): Promise<boolean> {
    const count = await prisma.base.count({ where: { id_base: id } });
    return count > 0;
  }

  async guardarDatosPerfil(id: string, datos: DatosPerfilInput): Promise<void> {
    await prisma.usuario.update({
      where: { id_usuario: id },
      data: datos,
    });
  }

  async crearBaseRemitente(id: string, datos: CrearBaseRemitenteInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const base = await tx.base.create({
        data: {
          nombre: datos.nombre,
          posicion_base: JSON.stringify({ lat: datos.latitud, lng: datos.longitud }),
          direccion: "",
        },
      });

      await tx.usuario.create({
        data: {
          id_usuario: id,
          rol: "REMITENTE",
          estado_cuenta: "APROBADA",
          id_base: base.id_base,
        },
      });
    });
  }

  private mapToDomain(row: any): Usuario {
    const rol = (row.rol as RolUsuario) ?? "SOLICITANTE";
    let nombre = "Usuario Sin Nombre";
    if (rol === "REMITENTE" && row.base) {
      nombre = row.base.nombre;
    } else if (row.nombre) {
      nombre = row.nombre;
    }
    return new Usuario(row.id_usuario, row.estado_cuenta as EstadoCuenta, rol, nombre);
  }
}
