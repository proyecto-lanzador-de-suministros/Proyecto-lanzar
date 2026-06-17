import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListarSolicitudesAdminUseCase } from "../domain/use-cases/ListarSolicitudesAdmin.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";

describe("ListarSolicitudesAdminUseCase", () => {
  let repoMock: { listarTodas: ReturnType<typeof vi.fn> };
  let useCase: ListarSolicitudesAdminUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { listarTodas: vi.fn() };
    useCase = new ListarSolicitudesAdminUseCase(
      repoMock as unknown as ForManagingSolicitudes,
    );
  });

  const propsBase = {
    id_solicitud: "sol-001",
    id_usuario: "usr-001",
    ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
    prioridad: PrioridadSolicitud.Media,
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    estado: EstadoSolicitud.Creada,
    fecha_solicitada: new Date("2026-01-01"),
    fechaActualizacion: new Date("2026-01-01"),
  };

  it("lista todas las solicitudes sin filtro", async () => {
    repoMock.listarTodas.mockResolvedValue([
      Solicitud.reconstruir(propsBase),
    ]);

    const resultado = await useCase.ejecutar();

    expect(repoMock.listarTodas).toHaveBeenCalledWith(undefined);
    expect(resultado).toHaveLength(1);
  });

  it("lista solicitudes filtradas por estado", async () => {
    repoMock.listarTodas.mockResolvedValue([]);

    await useCase.ejecutar("Asignada");

    expect(repoMock.listarTodas).toHaveBeenCalledWith("Asignada");
  });

  it("retorna array vacío si no hay solicitudes", async () => {
    repoMock.listarTodas.mockResolvedValue([]);

    const resultado = await useCase.ejecutar();

    expect(resultado).toEqual([]);
  });
});
