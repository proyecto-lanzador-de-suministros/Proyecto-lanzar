import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrarLanzadaUseCase } from "../domain/use-cases/RegistrarLanzada.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { NotificarLanzada } from "@/src/modules/notificaciones/domain/use-cases/NotificarLanzada.usecase";

describe("RegistrarLanzadaUseCase", () => {
  let repoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let historialMock: { registrar: ReturnType<typeof vi.fn> };
  let useCase: RegistrarLanzadaUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { buscarPorId: vi.fn(), actualizarEstado: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    historialMock = { registrar: vi.fn() };
    useCase = new RegistrarLanzadaUseCase(
      repoMock as unknown as ForManagingSolicitudes,
      new NotificarLanzada(notifierMock as any),
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

  it("marca la solicitud como lanzada, registra historial y notifica al solicitante", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.EnCamino });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "rem-001",
      rol: "remitente",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.Lanzada);
    
    expect(historialMock.registrar).toHaveBeenCalledWith({
      solicitudId: "sol-001",
      estadoAnterior: EstadoSolicitud.EnCamino,
      estadoNuevo: EstadoSolicitud.Lanzada,
      actorId: "rem-001",
    });

    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "usr-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.Lanzada,
    });
  });

  it("lanza error si el remitente no es el asignado", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.EnCamino, id_base: "rem-002" });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await expect(
      useCase.ejecutar({
        solicitudId: "sol-001",
        actorId: "rem-001",
        rol: "remitente",
      }),
    ).rejects.toMatchObject({ code: "PERMISO_DENEGADO" });
  });

  it("lanza error si la transición de estado es inválida", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lista });
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
