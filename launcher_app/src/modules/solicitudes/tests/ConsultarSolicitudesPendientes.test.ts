import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsultarSolicitudesPendientes } from "../domain/use-cases/ConsultarSolicitudesPendientes.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";

describe("ConsultarSolicitudesPendientes", () => {
  let repoMock: {
    listarPendientes: ReturnType<typeof vi.fn>;
    listarTodas: ReturnType<typeof vi.fn>;
  };
  let useCase: ConsultarSolicitudesPendientes;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { listarPendientes: vi.fn(), listarTodas: vi.fn() };
    useCase = new ConsultarSolicitudesPendientes(
      repoMock as unknown as ForManagingSolicitudes,
    );
  });

  const propsBase = {
    id_solicitud: "sol-001",
    id_usuario: "usr-001",
    ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
    prioridad: PrioridadSolicitud.Media,
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    estado: EstadoSolicitud.Asignada,
    fecha_solicitada: new Date("2026-01-01"),
    fechaActualizacion: new Date("2026-01-01"),
  };

  it("remitente lista pendientes de su base", async () => {
    const solicitudes = [Solicitud.reconstruir(propsBase)];
    repoMock.listarPendientes.mockResolvedValue(solicitudes);

    const resultado = await useCase.ejecutar({
      rol: "remitente",
      id_base: "base-007",
    });

    expect(repoMock.listarPendientes).toHaveBeenCalledWith("base-007");
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id_solicitud).toBe("sol-001");
  });

  it("admin lista todas las solicitudes con filtro 'asignada'", async () => {
    repoMock.listarTodas.mockResolvedValue([]);

    await useCase.ejecutar({ rol: "admin" });

    expect(repoMock.listarTodas).toHaveBeenCalledWith("asignada");
  });

  it("lanza error si remitente no proporciona id_base", async () => {
    await expect(
      useCase.ejecutar({ rol: "remitente" }),
    ).rejects.toThrow("Se requiere id_base");
  });
});
