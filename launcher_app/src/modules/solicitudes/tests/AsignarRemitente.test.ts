import { describe, it, expect, vi, beforeEach } from "vitest";
import { AsignarRemitenteUseCase } from "../domain/use-cases/AsignarRemitente.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import { Usuario } from "@/src/modules/usuarios/domain/entities/Usuario";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForManagingUsuarios } from "@/src/modules/usuarios/domain/ports/forManagingUsuarios.port";
import type { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

describe("AsignarRemitenteUseCase", () => {
  let solicitudRepoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    guardar: ReturnType<typeof vi.fn>;
  };
  let usuarioRepoMock: { buscarPorId: ReturnType<typeof vi.fn> };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let historialMock: { registrar: ReturnType<typeof vi.fn> };
  let useCase: AsignarRemitenteUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    solicitudRepoMock = { buscarPorId: vi.fn(), guardar: vi.fn() };
    usuarioRepoMock = { buscarPorId: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    historialMock = { registrar: vi.fn() };
    useCase = new AsignarRemitenteUseCase(
      solicitudRepoMock as unknown as ForManagingSolicitudes,
      usuarioRepoMock as unknown as ForManagingUsuarios,
      notifierMock as unknown as ForNotifying,
      historialMock as unknown as ForManagingHistorial,
    );
  });

  const propsSolicitudCreada = {
    id_solicitud: "sol-001",
    id_usuario: "usr-001",
    ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
    prioridad: PrioridadSolicitud.Media,
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    estado: EstadoSolicitud.Creada,
    fecha_solicitada: new Date("2026-01-01"),
    fechaActualizacion: new Date("2026-01-01"),
  };

  it("asigna remitente aprobado a la solicitud, registra historial y notifica a ambas partes", async () => {
    const remitente = new Usuario("rem-001", "APROBADA", "REMITENTE", "Base Sur");
    const solicitud = Solicitud.reconstruir(propsSolicitudCreada);
    usuarioRepoMock.buscarPorId.mockResolvedValue(remitente);
    solicitudRepoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar("sol-001", "rem-001", "admin-001");

    const solicitudGuardada = solicitudRepoMock.guardar.mock.calls[0][0] as Solicitud;
    expect(solicitudGuardada.estado).toBe(EstadoSolicitud.Asignada);
    expect(solicitudGuardada.id_base).toBe("rem-001");

    expect(historialMock.registrar).toHaveBeenCalledWith({
      solicitudId: "sol-001",
      estadoAnterior: EstadoSolicitud.Creada,
      estadoNuevo: EstadoSolicitud.Asignada,
      actorId: "admin-001",
    });

    expect(notifierMock.notificar).toHaveBeenCalledTimes(2);
    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "usr-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.Asignada,
    });
    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "rem-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.Asignada,
    });
  });

  it("lanza error si el remitente no existe", async () => {
    usuarioRepoMock.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar("sol-001", "rem-001", "admin-001"),
    ).rejects.toThrow("no encontrado");
  });

  it("lanza error si el usuario no tiene rol REMITENTE", async () => {
    usuarioRepoMock.buscarPorId.mockResolvedValue(
      new Usuario("usr-001", "APROBADA", "SOLICITANTE", "Juan"),
    );

    await expect(
      useCase.ejecutar("sol-001", "usr-001", "admin-001"),
    ).rejects.toThrow("no tiene el rol");
  });

  it("lanza error si el remitente no está aprobado", async () => {
    usuarioRepoMock.buscarPorId.mockResolvedValue(
      new Usuario("rem-001", "PENDIENTE", "REMITENTE", "Base Sur"),
    );

    await expect(
      useCase.ejecutar("sol-001", "rem-001", "admin-001"),
    ).rejects.toThrow("no está aprobado");
  });

  it("lanza error si la solicitud no existe", async () => {
    usuarioRepoMock.buscarPorId.mockResolvedValue(
      new Usuario("rem-001", "APROBADA", "REMITENTE", "Base Sur"),
    );
    solicitudRepoMock.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar("sol-001", "rem-001", "admin-001"),
    ).rejects.toThrow("no encontrada");
  });
});
