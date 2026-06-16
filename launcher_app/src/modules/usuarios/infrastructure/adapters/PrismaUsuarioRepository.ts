import { ForManagingUsuarios } from "../../domain/ports/forManagingUsuarios.port";
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

  private mapToDomain(row: any): Usuario {
    let rol: RolUsuario = "SOLICITANTE";
    let nombre = "Usuario Sin Nombre";

    if (row.remitente) { rol = "REMITENTE"; nombre = row.remitente.nombre_base; }
    else if (row.administrador) { rol = "ADMINISTRADOR"; nombre = row.administrador.nombre; }
    else if (row.solicitante) { rol = "SOLICITANTE"; nombre = row.solicitante.nombre; }

    return new Usuario(row.id_usuario, row.estado_cuenta as EstadoCuenta, rol, nombre);
  }
}