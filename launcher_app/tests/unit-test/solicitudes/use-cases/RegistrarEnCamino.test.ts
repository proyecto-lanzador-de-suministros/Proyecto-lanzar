import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrarEnCaminoUseCase } from "@/src/modules/solicitudes/domain/use-cases/RegistrarEnCamino.usecase";
import { Solicitud, PrioridadSolicitud, EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { NotificarEnCamino } from "@/src/modules/notificaciones/domain/use-cases/NotificarEnCamino.usecase";
import { Trayectoria } from "@/src/modules/trayectoria/domain/entities/Trayectoria";

function mockTrayectoria() {
  return Trayectoria.crear({
    id_trayectoria: "tra-001",
    id_envio: "env-001",
    punto_lanzamiento: { type: "Point", coordinates: [-62.3, -38.7] },
    offset_norte_m: 100,
    offset_este_m: 50,
    timestamp_estimado: new Date(),
    condiciones_seguras: true,
    condiciones_climaticas: { velocidad_viento_ms: 5, direccion_viento_grados: 180, presion_atmosferica_hPa: 1013, altitud_terreno_m: 0, temperatura_c: 20 },
    altitud_liberacion_m: 300,
    peso_total_kg: 20,
  });
}

describe("RegistrarEnCaminoUseCase", () => {
  let repoMock: {
    buscarPorId: ReturnType<typeof vi.fn>;
    actualizarEstado: ReturnType<typeof vi.fn>;
  };
  let notifierMock: { notificar: ReturnType<typeof vi.fn> };
  let historialMock: { registrar: ReturnType<typeof vi.fn> };
  let envioMock: {
    buscarPorIdSolicitud: ReturnType<typeof vi.fn>;
    guardarDatosTrayectoria: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    listarTodos: ReturnType<typeof vi.fn>;
    buscarPorId: ReturnType<typeof vi.fn>;
    asignarContenedor: ReturnType<typeof vi.fn>;
  };
  let trayectMock: { ejecutar: ReturnType<typeof vi.fn> };
  let prodMock: { buscarProductoPorIdentificador: ReturnType<typeof vi.fn>; listarCatalogo: ReturnType<typeof vi.fn>; listarBases: ReturnType<typeof vi.fn> };
  let useCase: RegistrarEnCaminoUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repoMock = { buscarPorId: vi.fn(), actualizarEstado: vi.fn() };
    notifierMock = { notificar: vi.fn() };
    historialMock = { registrar: vi.fn() };
    envioMock = {
      buscarPorIdSolicitud: vi.fn(),
      guardarDatosTrayectoria: vi.fn(),
      crear: vi.fn().mockResolvedValue({ id_envio: "env-001", id_solicitud: "sol-001", id_base: "rem-001", fecha_hora_programada: new Date(), estado_envio: "programado" }),
      listarTodos: vi.fn(),
      buscarPorId: vi.fn(),
      asignarContenedor: vi.fn(),
    };
    trayectMock = { ejecutar: vi.fn().mockResolvedValue(mockTrayectoria()) };
    prodMock = {
      buscarProductoPorIdentificador: vi.fn().mockResolvedValue({ id_producto: "prod-001", nombre: "Producto", peso_kg: 10 }),
      listarCatalogo: vi.fn(),
      listarBases: vi.fn(),
    };
    useCase = new RegistrarEnCaminoUseCase(
      repoMock as unknown as ForManagingSolicitudes,
      new NotificarEnCamino(notifierMock as any),
      historialMock as unknown as ForManagingHistorial,
      envioMock as any,
      trayectMock as any,
      prodMock as any,
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

  it("marca la solicitud como en camino, registra historial y notifica al solicitante", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lista });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "rem-001",
      rol: "remitente",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.EnCamino);
    
    expect(historialMock.registrar).toHaveBeenCalledWith({
      solicitudId: "sol-001",
      estadoAnterior: EstadoSolicitud.Lista,
      estadoNuevo: EstadoSolicitud.EnCamino,
      actorId: "rem-001",
    });

    expect(notifierMock.notificar).toHaveBeenCalledWith({
      destinatario: "usr-001",
      solicitudId: "sol-001",
      estado: EstadoSolicitud.EnCamino,
    });
  });

  it("marca la solicitud como en camino como Admin", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lista });
    repoMock.buscarPorId.mockResolvedValue(solicitud);

    await useCase.ejecutar({
      solicitudId: "sol-001",
      actorId: "admin-001",
      rol: "admin",
    });

    expect(repoMock.actualizarEstado).toHaveBeenCalledWith("sol-001", EstadoSolicitud.EnCamino);
  });

  it("lanza error si el remitente no es el asignado", async () => {
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.Lista, id_base: "rem-002" });
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
    const solicitud = Solicitud.reconstruir({ ...propsBase, estado: EstadoSolicitud.EnPreparacion });
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
