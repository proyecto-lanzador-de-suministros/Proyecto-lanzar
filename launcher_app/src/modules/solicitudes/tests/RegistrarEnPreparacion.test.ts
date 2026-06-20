import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrarEnPreparacionUseCase } from "../domain/use-cases/RegistrarEnPreparacion.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { NotificarEnPreparacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarEnPreparacion.usecase";

describe("RegistrarEnPreparacionUseCase", () => {
  let repoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let historialMock: { registrar: ReturnType<typeof vi.fn> };
  let useCase: RegistrarEnPreparacionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { buscarPorId: vi.fn(), actualizarEstado: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    historialMock = { registrar: vi.fn() };
    useCase = new RegistrarEnPreparacionUseCase(
      repoMock as unknown as ForManagingSolicitudes,
      new NotificarEnPreparacion(notifierMock as any),
      historialMock as unknown as ForManagingHistorial,
    );
  });

  const propsBase = {
    id_solicitud: "sol-001",
    id_usuario: "usr-001",
    id_base: "rem-001",
    ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
    prioridad: PrioridadSolicitud.Media,
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    fecha_solicitada: new Date("2026-01-01"),
    fechaActualizacion: new Date("2026-01-01"),
  };

  it("inicia preparación de la solicitud, registra historial y notifica al solicitante (Remitente)", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Asignada });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "rem-001",
      rol: "remitente",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.EnPreparacion);
    
    expect(historialMock.registrar).toHaveBeenCalledWith({
      solicitudId: "sol-001",
      estadoAnterior: EstadoSolicitud.Asignada,
      estadoNuevo: EstadoSolicitud.EnPreparacion,
      actorId: "rem-001",
    });

    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "usr-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.EnPreparacion,
    });
  });

  it("inicia preparación de la solicitud como Admin", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Asignada });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "admin-001",
      rol: "admin",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.EnPreparacion);
  });

  it("lanza error si el remitente no es el asignado", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Asignada, id_base: "rem-002" });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await expect(
      useCase.ejecutar({
        solicitudId: "sol-001",
        actorId: "rem-001",
        rol: "remitente",
      }),
    ).rejects.toMatchObject({ code: "PERMISO_DENEGADO" });
  });

  it("lanza error si la solicitud no existe", async () => {
    repoMock.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({
        solicitudId: "no-existe",
        actorId: "rem-001",
        rol: "remitente",
      }),
    ).rejects.toMatchObject({ code: "SOLICITUD_NO_ENCONTRADA" });
  });

  it("lanza error si la transición de estado es inválida (ej. ya está en camino)", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.EnCamino });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await expect(
      useCase.ejecutar({
        solicitudId: "sol-001",
        actorId: "rem-001",
        rol: "remitente",
      }),
    ).rejects.toMatchObject({ code: "TRANSICION_INVALIDA" });
  });
});
