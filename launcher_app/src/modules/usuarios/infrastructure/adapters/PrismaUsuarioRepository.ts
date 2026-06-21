import { ForManagingUsuarios, BaseRemitenteData, ActualizarBaseRemitenteInput, CrearBaseRemitenteInput } from "../../domain/ports/forManagingUsuarios.port";
import { Usuario, EstadoCuenta, RolUsuario } from "../../domain/entities/Usuario";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaUsuarioRepository implements ForManagingUsuarios {
  async buscarPorId(id: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { remitente: true, solicitante: true, administrador: true }
    });

    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listarPendientes(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({
      where: { estado_cuenta: "PENDIENTE" },
      include: { remitente: true, solicitante: true, administrador: true }
    });

    return rows.map(row => this.mapToDomain(row));
  }

  async listarTodos(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({
      include: { remitente: true, solicitante: true, administrador: true },
      orderBy: { estado_cuenta: "asc" } // Los PENDIENTES aparecerán primero
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
    const rows = await prisma.remitente.findMany({
      include: { usuario: { select: { estado_cuenta: true } } },
      orderBy: { nombre_base: "asc" },
    });

    return rows.map((r) => ({
      id_remitente: r.id_remitente,
      nombre_base: r.nombre_base,
      latitud_base: r.latitud_base,
      longitud_base: r.longitud_base,
      capacidad_pista: r.capacidad_pista,
      estado_cuenta: r.usuario.estado_cuenta,
      configuracionPendiente: r.latitud_base === 0 && r.longitud_base === 0,
    }));
  }

  async actualizarBaseRemitente(id: string, datos: ActualizarBaseRemitenteInput): Promise<void> {
    await prisma.remitente.update({
      where: { id_remitente: id },
      data: {
        ...(datos.nombre_base !== undefined && { nombre_base: datos.nombre_base }),
        ...(datos.latitud_base !== undefined && { latitud_base: datos.latitud_base }),
        ...(datos.longitud_base !== undefined && { longitud_base: datos.longitud_base }),
        ...(datos.capacidad_pista !== undefined && { capacidad_pista: datos.capacidad_pista }),
      },
    });
  }

  async baseExiste(id: string): Promise<boolean> {
    const count = await prisma.remitente.count({
      where: { id_remitente: id },
    });
    return count > 0;
  }

  async crearBaseRemitente(id: string, datos: CrearBaseRemitenteInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.usuario.create({
        data: {
          id_usuario: id,
          estado_cuenta: "APROBADA",
        },
      });

      await tx.remitente.create({
        data: {
          id_remitente: id,
          nombre_base: datos.nombre_base,
          latitud_base: datos.latitud_base,
          longitud_base: datos.longitud_base,
          capacidad_pista: datos.capacidad_pista,
        },
      });
    });
  }

  private mapToDomain(row: any): Usuario {
    let rol: RolUsuario = "SOLICITANTE";
    let nombre = "Usuario Sin Nombre";

    if (row.remitente) { rol = "REMITENTE"; nombre = row.remitente.nombre_base; }
    else if (row.administrador) { rol = "ADMINISTRADOR"; nombre = row.administrador.nombre; }
    else if (row.solicitante) { rol = "SOLICITANTE"; nombre = row.solicitante.nombre; }

    return new Usuario(row.id_usuario, row.estado_cuenta as EstadoCuenta, rol, nombre);
  }
}