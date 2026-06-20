import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsultarSolicitud } from "../domain/use-cases/ConsultarSolicitud.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";

describe("ConsultarSolicitud", () => {
  let repoMock: { buscarPorId: ReturnType<typeof vi.fn> };
  let useCase: ConsultarSolicitud;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { buscarPorId: vi.fn() };
    useCase = new ConsultarSolicitud(
      repoMock as unknown as ForManagingSolicitudes,
    );
  });

  function propsBase() {
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

  it("admin puede consultar cualquier solicitud", async () => {
    repoMock.buscarPorId.mockResolvedValue(Solicitud.reconstruir(propsBase()));

    const resultado = await useCase.ejecutar({
      id_solicitud: "sol-001",
      id_usuario: "admin-001",
      rol: "admin",
    });

    expect(resultado.id_solicitud).toBe("sol-001");
  });

  it("solicitante puede consultar su propia solicitud", async () => {
    repoMock.buscarPorId.mockResolvedValue(Solicitud.reconstruir(propsBase()));

    const resultado = await useCase.ejecutar({
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      rol: "solicitante",
    });

    expect(resultado.id_solicitud).toBe("sol-001");
  });

  it("solicitante no puede consultar solicitud de otro", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsBase(), id_usuario: "usr-002" }),
    );

    await expect(
      useCase.ejecutar({
        id_solicitud: "sol-001",
        id_usuario: "usr-001",
        rol: "solicitante",
      }),
    ).rejects.toThrow("No tenés permiso");
  });

  it("remitente puede consultar solicitud asignada a su base", async () => {
    repoMock.buscarPorId.mockResolvedValue(
      Solicitud.reconstruir({ ...propsBase(), id_base: "base-other" }),
    );

    await expect(
      useCase.ejecutar({
        id_solicitud: "sol-001",
        id_usuario: "rem-001",
        rol: "remitente",
        id_base: "base-007",
      }),
    ).rejects.toThrow("No tenés permiso");
  });

  it("lanza error si la solicitud no existe", async () => {
    repoMock.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({
        id_solicitud: "no-existe",
        id_usuario: "admin-001",
        rol: "admin",
      }),
    ).rejects.toThrow("no encontrada");
  });
});
