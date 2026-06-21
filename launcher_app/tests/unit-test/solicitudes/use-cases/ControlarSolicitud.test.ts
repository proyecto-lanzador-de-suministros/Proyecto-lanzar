import { describe, it, expect, vi, beforeEach } from "vitest";
import { ControlarSolicitud } from "@/src/modules/solicitudes/domain/use-cases/ControlarSolicitud.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";
import type { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";
import { NotificarRechazo } from "@/src/modules/notificaciones/domain/use-cases/NotificarRechazo.usecase";

describe("ControlarSolicitud", () => {
  let repoMock: { actualizarEstado: ReturnType<typeof vi.fn> };
  let stockMock: { verificarYReservar: ReturnType<typeof vi.fn> };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let useCase: ControlarSolicitud;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { actualizarEstado: vi.fn() };
    stockMock = { verificarYReservar: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    useCase = new ControlarSolicitud(
      repoMock as unknown as ForManagingSolicitudes,
      stockMock as unknown as ForManagingStock,
      new NotificarRechazo(notifierMock as any),
    );
  });

  function solicitudDePrueba(): Solicitud {
    return Solicitud.crear({
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      ubicacion_destino: { type: "Point", coordinates: [-62.3, -38.7] },
      prioridad: PrioridadSolicitud.Media,
      productos: [{ productoId: "prod-001", cantidad: 2 }],
    });
  }

  it("asigna base y retorna asignada:true cuando hay stock", async () => {
    stockMock.verificarYReservar.mockResolvedValue({
      disponible: true,
      id_base: "base-007",
    });

    const resultado = await useCase.ejecutar(solicitudDePrueba());

    expect(resultado.asignada).toBe(true);
    expect(resultado.solicitud.estado).toBe(EstadoSolicitud.Asignada);
    expect(resultado.solicitud.id_base).toBe("base-007");
    expect(repoMock.actualizarEstado).toHaveBeenCalledWith(
      "sol-001",
      EstadoSolicitud.Asignada,
      { id_base: "base-007" },
    );
  });

  it("rechaza y retorna asignada:false con stockFaltante cuando no hay stock", async () => {
    stockMock.verificarYReservar.mockResolvedValue({
      disponible: false,
      productosFaltantes: ["prod-001"],
    });

    const resultado = await useCase.ejecutar(solicitudDePrueba());

    expect(resultado.asignada).toBe(false);
    expect(resultado.solicitud.estado).toBe(EstadoSolicitud.Rechazada);
    expect(resultado.stockFaltante).toEqual(["prod-001"]);
    expect(repoMock.actualizarEstado).toHaveBeenCalledWith(
      "sol-001",
      EstadoSolicitud.Rechazada,
    );
  });

  it.todo("notifica NotificarAsignacion al solicitante cuando hay stock");
  it("notifica NotificarRechazo al solicitante cuando no hay stock", async () => {
    stockMock.verificarYReservar.mockResolvedValue({
      disponible: false,
      productosFaltantes: ["prod-001"],
    });

    await useCase.ejecutar(solicitudDePrueba());

    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "usr-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.Rechazada,
    });
  });

  it("no asigna id_base en actualizarEstado cuando el stock rechaza", async () => {
    stockMock.verificarYReservar.mockResolvedValue({
      disponible: false,
      productosFaltantes: ["prod-002"],
    });

    await useCase.ejecutar(solicitudDePrueba());

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith(
      "sol-001",
      EstadoSolicitud.Rechazada,
    );
  });
});
