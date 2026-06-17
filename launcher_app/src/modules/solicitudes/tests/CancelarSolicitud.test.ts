import { describe, it, expect, vi, beforeEach } from "vitest";
import { CancelarSolicitud } from "../domain/use-cases/CancelarSolicitud.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";

describe("CancelarSolicitud", () => {
  let repoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };
  let stockMock: { liberarReserva: ReturnType<typeof vi.fn> };
  let useCase: CancelarSolicitud;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = {
      buscarPorId: vi.fn(),
      actualizarEstado: vi.fn(),
    };
    stockMock = { liberarReserva: vi.fn() };
    useCase = new CancelarSolicitud(
      repoMock as unknown as ForManagingSolicitudes,
      stockMock as unknown as ForManagingStock,
    );
  });

  function propsCreada() {
    return {
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
      prioridad: PrioridadSolicitud.Media,
      productos: [{ productoId: "prod-001", cantidad: 2 }],
      estado: EstadoSolicitud.Creada,
      fecha_solicitada: new Date("2026-01-01"),
      fechaActualizacion: new Date("2026-01-01"),
    };
  }

  it("cancela solicitud propia como solicitante", async () => {
    repoMock.buscarPorId.mockResolvedValue(Solicitud.reconstruir(propsCreada()));

    const resultado = await useCase.ejecutar({
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      rol: "solicitante",
    });

    expect(resultado.estado).toBe(EstadoSolicitud.Cancelada);
    expect(repoMock.actualizarEstado).toHaveBeenCalledWith(
      "sol-001",
      EstadoSolicitud.Cancelada,
      { motivoCancelacion: undefined },
    );
  });

  it("libera stock si la solicitud tenía base asignada", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsCreada(), id_base: "base-007", estado: EstadoSolicitud.Asignada }),
    );

    await useCase.ejecutar({
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      rol: "admin",
      motivo: "Reasignación de recursos",
    });

    expect(stockMock.liberarReserva).toHaveBeenCalledWith({
      id_base: "base-007",
      productos: [{ productoId: "prod-001", cantidad: 2 }],
    });
  });

  it("no libera stock si la solicitud no tenía base asignada", async () => {
    repoMock.buscarPorId.mockResolvedValue(Solicitud.reconstruir(propsCreada()));

    await useCase.ejecutar({
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      rol: "admin",
    });

    expect(stockMock.liberarReserva).not.toHaveBeenCalled();
  });

  it("lanza error si la solicitud no existe", async () => {
    repoMock.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({ id_solicitud: "no-existe", id_usuario: "usr-001", rol: "admin" }),
    ).rejects.toThrow("no encontrada");
  });

  it("lanza error si solicitante intenta cancelar solicitud ajena", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsCreada(), id_usuario: "usr-002" }),
    );

    await expect(
      useCase.ejecutar({ id_solicitud: "sol-001", id_usuario: "usr-001", rol: "solicitante" }),
    ).rejects.toThrow("No tenés permiso");
  });

  it("admin puede cancelar cualquier solicitud", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsCreada(), id_usuario: "usr-002" }),
    );

    const resultado = await useCase.ejecutar({
      id_solicitud: "sol-001",
      id_usuario: "admin-001",
      rol: "admin",
    });

    expect(resultado.estado).toBe(EstadoSolicitud.Cancelada);
  });
});
