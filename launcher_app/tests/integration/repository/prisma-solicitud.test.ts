import { describe, it, expect } from "vitest";
import { PrismaSolicitudesRepository } from "@/src/modules/solicitudes/infrastructure/adapters/PrismaSolicitudRepository";
import {
  Solicitud,
  EstadoSolicitud,
  PrioridadSolicitud,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import {
  crearSolicitanteFixture,
  crearRemitenteFixture,
  crearProductoFixture,
  crearDetalleSolicitudFixture,
} from "../fixtures/shared.fixtures";

const repo = new PrismaSolicitudesRepository();

describe("PrismaSolicitudesRepository (integration)", () => {
  it("guardar crea una solicitud en la DB", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);
    const { idProducto } = await crearProductoFixture(prisma);
    const idSolicitud = crypto.randomUUID();

    const solicitud = Solicitud.crear({
      id_solicitud: idSolicitud,
      id_usuario: idUsuario,
      ubicacion_destino: { type: "Point", coordinates: [-62.3, -38.7] },
      prioridad: PrioridadSolicitud.Media,
      productos: [{ productoId: idProducto, cantidad: 2 }],
    });

    await repo.guardar(solicitud);

    const row = await prisma.solicitud.findUnique({
      where: { id_solicitud: idSolicitud },
    });
    expect(row).not.toBeNull();
    expect(row!.id_solicitante).toBe(idUsuario);
    expect(row!.estado_actual).toBe(EstadoSolicitud.Creada);
    expect(row!.prioridad).toBe(PrioridadSolicitud.Media);
    expect(row!.latitud_destino).toBe(-38.7);
    expect(row!.longitud_destino).toBe(-62.3);
    expect(row!.id_remitente).toBeNull();
  });

  it("buscarPorId retorna null para ID inexistente", async () => {
    const resultado = await repo.buscarPorId("no-existe");
    expect(resultado).toBeNull();
  });

  it("buscarPorId retorna una entidad Solicitud para ID existente", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);
    const { idProducto } = await crearProductoFixture(prisma);
    const idSolicitud = crypto.randomUUID();

    await prisma.solicitud.create({
      data: {
        id_solicitud: idSolicitud,
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Alta,
        latitud_destino: -34.6,
        longitud_destino: -58.38,
      },
    });

    const resultado = await repo.buscarPorId(idSolicitud);

    expect(resultado).toBeInstanceOf(Solicitud);
    expect(resultado!.id_solicitud).toBe(idSolicitud);
    expect(resultado!.id_usuario).toBe(idUsuario);
    expect(resultado!.estado).toBe(EstadoSolicitud.Creada);
    expect(resultado!.prioridad).toBe(PrioridadSolicitud.Alta);
    expect(resultado!.ubicacion_destino.coordinates).toEqual([-58.38, -34.6]);
  });

  it("buscarPorId mapea detalles a productos", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);
    const { idProducto } = await crearProductoFixture(prisma);
    const idSolicitud = crypto.randomUUID();

    await prisma.solicitud.create({
      data: {
        id_solicitud: idSolicitud,
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });
    await crearDetalleSolicitudFixture(prisma, {
      idSolicitud,
      idProducto,
      cantidad: 3,
    });

    const resultado = await repo.buscarPorId(idSolicitud);

    expect(resultado!.productos).toHaveLength(1);
    expect(resultado!.productos[0]).toEqual({
      productoId: idProducto,
      cantidad: 3,
    });
  });

  it("actualizar persiste cambios en la DB", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);
    const { idProducto } = await crearProductoFixture(prisma);
    const { idRemitente } = await crearRemitenteFixture(prisma);
    const idSolicitud = crypto.randomUUID();

    await prisma.solicitud.create({
      data: {
        id_solicitud: idSolicitud,
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });

    const solicitud = Solicitud.reconstruir({
      id_solicitud: idSolicitud,
      id_usuario: idUsuario,
      ubicacion_destino: { type: "Point", coordinates: [-58.38, -34.6] },
      prioridad: PrioridadSolicitud.Alta,
      productos: [{ productoId: idProducto, cantidad: 2 }],
      estado: EstadoSolicitud.Asignada,
      id_base: idRemitente,
      fecha_solicitada: new Date(),
      fechaActualizacion: new Date(),
    });

    await repo.actualizar(solicitud);

    const row = await prisma.solicitud.findUnique({
      where: { id_solicitud: idSolicitud },
    });
    expect(row!.estado_actual).toBe(EstadoSolicitud.Asignada);
    expect(row!.prioridad).toBe(PrioridadSolicitud.Alta);
    expect(row!.id_remitente).toBe(idRemitente);
    expect(row!.latitud_destino).toBe(-34.6);
    expect(row!.longitud_destino).toBe(-58.38);
  });

  it("actualizarEstado cambia el estado en la DB", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);
    const { idRemitente } = await crearRemitenteFixture(prisma);
    const idSolicitud = crypto.randomUUID();

    await prisma.solicitud.create({
      data: {
        id_solicitud: idSolicitud,
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });

    await repo.actualizarEstado(idSolicitud, EstadoSolicitud.Asignada, {
      id_base: idRemitente,
    });

    const row = await prisma.solicitud.findUnique({
      where: { id_solicitud: idSolicitud },
    });
    expect(row!.estado_actual).toBe(EstadoSolicitud.Asignada);
    expect(row!.id_remitente).toBe(idRemitente);
  });

  it("actualizarEstado incluye motivo_cancelacion cuando se provee", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);
    const idSolicitud = crypto.randomUUID();

    await prisma.solicitud.create({
      data: {
        id_solicitud: idSolicitud,
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Asignada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });

    await repo.actualizarEstado(idSolicitud, EstadoSolicitud.Cancelada, {
      motivoCancelacion: "Ya no se necesita",
    });

    const row = await prisma.solicitud.findUnique({
      where: { id_solicitud: idSolicitud },
    });
    expect(row!.estado_actual).toBe(EstadoSolicitud.Cancelada);
    expect(row!.motivo_cancelacion).toBe("Ya no se necesita");
  });

  it("listarPorSolicitante retorna solo las solicitudes del usuario", async () => {
    const { idUsuario: user1 } = await crearSolicitanteFixture(prisma);
    const { idUsuario: user2 } = await crearSolicitanteFixture(prisma);

    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: user1,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });
    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: user1,
        estado_actual: EstadoSolicitud.Asignada,
        prioridad: PrioridadSolicitud.Alta,
        latitud_destino: -34.6,
        longitud_destino: -58.38,
      },
    });
    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: user2,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Baja,
        latitud_destino: -31.4,
        longitud_destino: -64.18,
      },
    });

    const resultado = await repo.listarPorSolicitante(user1);

    expect(resultado).toHaveLength(2);
    expect(
      resultado.every((s) => s.id_usuario === user1),
    ).toBe(true);
  });

  it("listarTodas retorna todas las solicitudes sin filtro", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);

    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });
    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Asignada,
        prioridad: PrioridadSolicitud.Alta,
        latitud_destino: -34.6,
        longitud_destino: -58.38,
      },
    });

    const resultado = await repo.listarTodas();

    expect(resultado.length).toBeGreaterThanOrEqual(2);
  });

  it("listarTodas filtra por estado cuando se pasa estadoFiltro", async () => {
    const { idUsuario } = await crearSolicitanteFixture(prisma);

    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
        latitud_destino: -38.7,
        longitud_destino: -62.3,
      },
    });
    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        id_solicitante: idUsuario,
        estado_actual: EstadoSolicitud.Asignada,
        prioridad: PrioridadSolicitud.Alta,
        latitud_destino: -34.6,
        longitud_destino: -58.38,
      },
    });

    const resultado = await repo.listarTodas(EstadoSolicitud.Asignada);

    expect(resultado.length).toBeGreaterThanOrEqual(1);
    expect(resultado.every((s) => s.estado === EstadoSolicitud.Asignada)).toBe(
      true,
    );
  });
});
