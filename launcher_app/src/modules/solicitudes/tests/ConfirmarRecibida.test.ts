import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmarRecibidaUseCase } from "../domain/use-cases/ConfirmarRecibida.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

describe("ConfirmarRecibidaUseCase", () => {
  let repoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let historialMock: { registrar: ReturnType<typeof vi.fn> };
  let useCase: ConfirmarRecibidaUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { buscarPorId: vi.fn(), actualizarEstado: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    historialMock = { registrar: vi.fn() };
    useCase = new ConfirmarRecibidaUseCase(
      repoMock as unknown as ForManagingSolicitudes,
      notifierMock as unknown as ForNotifying,
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

  it("confirma recepción de la solicitud, registra historial y notifica al remitente (Solicitante)", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lanzada });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "usr-001",
      rol: "solicitante",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.Completada);
    
    expect(historialMock.registrar).toHaveBeenCalledWith({
      solicitudId: "sol-001",
      estadoAnterior: EstadoSolicitud.Lanzada,
      estadoNuevo: EstadoSolicitud.Completada,
      actorId: "usr-001",
    });

    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "rem-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.Completada,
    });
  });

  it("confirma recepción de la solicitud como Admin", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lanzada });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "admin-001",
      rol: "admin",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.Completada);
  });

  it("lanza error si el solicitante no es el dueño", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lanzada, id_usuario: "usr-002" });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await expect(
      useCase.ejecutar({
        solicitudId: "sol-001",
        actorId: "usr-001",
        rol: "solicitante",
      }),
    ).rejects.toMatchObject({ code: "PERMISO_DENEGADO" });
  });

  it("lanza error si la transición de estado es inválida", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.EnCamino });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await expect(
      useCase.ejecutar({
        solicitudId: "sol-001",
        actorId: "usr-001",
        rol: "solicitante",
      }),
    ).rejects.toMatchObject({ code: "TRANSICION_INVALIDA" });
  });
});
