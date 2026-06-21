import { describe, it, expect, vi, beforeEach } from "vitest";
import { CambiarEstadoSolicitudUseCase } from "@/src/modules/solicitudes/domain/use-cases/CambiarEstadoSolicitud.usecase";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";

describe("CambiarEstadoSolicitudUseCase", () => {
  let repoMock: { actualizarEstado: ReturnType<typeof vi.fn> };
  let useCase: CambiarEstadoSolicitudUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { actualizarEstado: vi.fn() };
    useCase = new CambiarEstadoSolicitudUseCase(
      repoMock as unknown as ForManagingSolicitudes,
    );
  });

  it("cambia el estado de la solicitud", async () => {
    await useCase.ejecutar("sol-001", EstadoSolicitud.EnPreparacion);

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith(
      "sol-001",
      EstadoSolicitud.EnPreparacion,
    );
  });

  it("puede cambiar a cualquier estado sin extras", async () => {
    await useCase.ejecutar("sol-001", EstadoSolicitud.Cancelada);

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith(
      "sol-001",
      EstadoSolicitud.Cancelada,
    );
  });
});
