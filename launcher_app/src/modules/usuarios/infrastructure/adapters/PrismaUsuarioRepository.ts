import { ForManagingUsuarios, BaseRemitenteData, ActualizarBaseRemitenteInput, CrearBaseRemitenteInput } from "../../domain/ports/forManagingUsuarios.port";
import { Usuario, EstadoCuenta, RolUsuario } from "../../domain/entities/Usuario";
import { prisma } from "@/src/infrastructure/db/prisma.client";

export class PrismaUsuarioRepository implements ForManagingUsuarios {
  async buscarPorId(id: string): Promise<Usuario | null> {
    const row = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { remitente: { include: { base: true } }, solicitante: true, administrador: true }
    });

    if (!row) return null;
    return this.mapToDomain(row);
  }

  async listarPendientes(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({
      where: { estado_cuenta: "PENDIENTE" },
      include: { remitente: { include: { base: true } }, solicitante: true, administrador: true }
    });

    return rows.map(row => this.mapToDomain(row));
  }

  async listarTodos(): Promise<Usuario[]> {
    const rows = await prisma.usuario.findMany({
      include: { remitente: { include: { base: true } }, solicitante: true, administrador: true },
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
    const rows = await prisma.remitente.findMany({
      include: { base: true, usuario: { select: { estado_cuenta: true } } },
      orderBy: { base: { nombre: "asc" } },
    });

    return rows.map((r) => ({
      id_remitente: r.id_remitente,
      id_base: r.id_base,
      nombre: r.base.nombre,
      latitud: r.base.latitud,
      longitud: r.base.longitud,
      capacidad_pista: r.base.capacidad_pista,
      estado_cuenta: r.usuario.estado_cuenta,
      configuracionPendiente: r.base.latitud === 0 && r.base.longitud === 0,
    }));
  }

  async actualizarBaseRemitente(id: string, datos: ActualizarBaseRemitenteInput): Promise<void> {
    // Buscar el remitente para obtener el id_base
    const remitente = await prisma.remitente.findUnique({
      where: { id_remitente: id },
      select: { id_base: true },
    });
    if (!remitente) return;

    await prisma.base.update({
      where: { id_base: remitente.id_base },
      data: {
        ...(datos.nombre !== undefined && { nombre: datos.nombre }),
        ...(datos.latitud !== undefined && { latitud: datos.latitud }),
        ...(datos.longitud !== undefined && { longitud: datos.longitud }),
        ...(datos.capacidad_pista !== undefined && { capacidad_pista: datos.capacidad_pista }),
      },
    });
  }

  async obtenerBaseDeRemitente(remitenteId: string): Promise<string | null> {
    const remitente = await prisma.remitente.findUnique({
      where: { id_remitente: remitenteId },
      select: { id_base: true },
    });
    return remitente?.id_base ?? null;
  }

  async baseExiste(id: string): Promise<boolean> {
    const count = await prisma.base.count({
      where: { id_base: id },
    });
    return count > 0;
  }

  async crearBaseRemitente(id: string, datos: CrearBaseRemitenteInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const base = await tx.base.create({
        data: {
          nombre: datos.nombre,
          latitud: datos.latitud,
          longitud: datos.longitud,
          direccion: "",
          capacidad_pista: datos.capacidad_pista,
        },
      });

      await tx.usuario.create({
        data: {
          id_usuario: id,
          estado_cuenta: "APROBADA",
        },
      });

      await tx.remitente.create({
        data: {
          id_remitente: id,
          id_base: base.id_base,
        },
      });
    });
  }

  private mapToDomain(row: any): Usuario {
    let rol: RolUsuario = "SOLICITANTE";
    let nombre = "Usuario Sin Nombre";

    if (row.remitente) { rol = "REMITENTE"; nombre = row.remitente.base.nombre; }
    else if (row.administrador) { rol = "ADMINISTRADOR"; nombre = row.administrador.nombre; }
    else if (row.solicitante) { rol = "SOLICITANTE"; nombre = row.solicitante.nombre; }

    return new Usuario(row.id_usuario, row.estado_cuenta as EstadoCuenta, rol, nombre);
  }
}
