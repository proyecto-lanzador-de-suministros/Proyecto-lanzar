import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnularSolicitudUseCase } from "../domain/use-cases/AnularSolicitud.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

describe("AnularSolicitudUseCase", () => {
  let repoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    guardar: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
  };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let historialMock: { registrar: ReturnType<typeof vi.fn> };
  let useCase: AnularSolicitudUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { buscarPorId: vi.fn(), guardar: vi.fn(), actualizar: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    historialMock = { registrar: vi.fn() };
    useCase = new AnularSolicitudUseCase(
      repoMock as unknown as ForManagingSolicitudes,
      notifierMock as unknown as ForNotifying,
      historialMock as unknown as ForManagingHistorial,
    );
  });

  const propsBase = {
    id_solicitud: "sol-001",
    id_usuario: "usr-001",
    ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
    prioridad: PrioridadSolicitud.Media,
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    fecha_solicitada: new Date("2026-01-01"),
    fechaActualizacion: new Date("2026-01-01"),
  };

  it("anula la solicitud, registra historial y notifica al solicitante", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Asignada });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar("sol-001", "Incumplimiento de normas", "admin-001");

    expect(repoMock.actualizar).toHaveBeenCalled();
    const solicitudGuardada = repoMock.actualizar.mock.calls[0][0] as Solicitud;
    expect(solicitudGuardada.estado).toBe(EstadoSolicitud.Anulada);
    expect(solicitudGuardada.motivoAnulacion).toBe("Incumplimiento de normas");

    expect(historialMock.registrar).toHaveBeenCalledWith({
      solicitudId: "sol-001",
      estadoAnterior: EstadoSolicitud.Asignada,
      estadoNuevo: EstadoSolicitud.Anulada,
      actorId: "admin-001",
      motivo: "Incumplimiento de normas",
    });

    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "usr-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.Anulada,
    });
  });

  it("lanza error si la solicitud no existe", async () => {
    repoMock.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar("no-existe", "motivo", "admin-001"),
    ).rejects.toMatchObject({ code: "SOLICITUD_NO_ENCONTRADA" });
  });

  it("lanza error si la solicitud ya está completada", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Completada }),
    );

    await expect(
      useCase.ejecutar("sol-001", "motivo", "admin-001"),
    ).rejects.toMatchObject({ code: "ESTADO_NO_ANULABLE" });
  });

  it("lanza error si la solicitud ya está cancelada", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Cancelada }),
    );

    await expect(
      useCase.ejecutar("sol-001", "motivo", "admin-001"),
    ).rejects.toMatchObject({ code: "ESTADO_NO_ANULABLE" });
  });

  it("lanza error si la solicitud ya está anulada", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Anulada }),
    );

    await expect(
      useCase.ejecutar("sol-001", "motivo", "admin-001"),
    ).rejects.toMatchObject({ code: "ESTADO_NO_ANULABLE" });
  });
});
