import { describe, it, expect, vi, beforeEach } from "vitest";
import { CrearSolicitud } from "../domain/use-cases/CrearSolicitud.usecase";
import { ControlarSolicitud } from "../domain/use-cases/ControlarSolicitud.usecase";
import { PrismaSolicitudesRepository } from "../infrastructure/adapters/PrismaSolicitudRepository";
import {
  PrioridadSolicitud,
  EstadoSolicitud,
} from "../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

vi.mock("@/src/infrastructure/db/prisma.client", () => ({
  prisma: {
    solicitud: {
      create: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  solicitud: {
    create: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

describe("CrearSolicitud", () => {
  let repo: PrismaSolicitudesRepository;
  let controlarSolicitudMock: { ejecutar: ReturnType<typeof vi.fn> };
  let useCase: CrearSolicitud;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaSolicitudesRepository();
    controlarSolicitudMock = { ejecutar: vi.fn() };
    useCase = new CrearSolicitud(
      repo,
      controlarSolicitudMock as unknown as ControlarSolicitud,
    );
  });

  const inputBase = {
    id_usuario: "user-1",
    prioridad: PrioridadSolicitud.Media,
    ubicacion_destino: {
      type: "Point" as const,
      coordinates: [-58.3816, -34.6037] as [number, number],
    },
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    fecha_estimada: new Date("2026-06-15"),
  };

  it("crea una solicitud con estado creada antes de delegar el control de stock", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockImplementation(async (solicitud) => ({
      solicitud,
      asignada: true,
    }));

    const resultado = await useCase.ejecutar(inputBase);

    expect(resultado.solicitud.estado).toBe(EstadoSolicitud.Creada);
    expect(resultado.solicitud.id_solicitud).toBeDefined();
  });

  it("persiste la solicitud en Prisma antes de delegar a ControlarSolicitud", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockImplementation(async (solicitud) => ({
      solicitud,
      asignada: true,
    }));

    await useCase.ejecutar(inputBase);

    expect(prismaMock.solicitud.create).toHaveBeenCalledOnce();
    expect(prismaMock.solicitud.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id_solicitante: "user-1",
        estado_actual: EstadoSolicitud.Creada,
        prioridad: PrioridadSolicitud.Media,
      }),
    });
  });

  it("delega el control de stock a ControlarSolicitud con la solicitud creada", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockImplementation(async (solicitud) => ({
      solicitud,
      asignada: true,
    }));

    await useCase.ejecutar(inputBase);

    expect(controlarSolicitudMock.ejecutar).toHaveBeenCalledOnce();
    expect(controlarSolicitudMock.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: "user-1" }),
    );
  });

  it("retorna el resultado de ControlarSolicitud (asignada: false con stockFaltante)", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockResolvedValue({
      solicitud: expect.anything(),
      asignada: false,
      stockFaltante: ["prod-001"],
    });

    const resultado = await useCase.ejecutar(inputBase);

    expect(resultado.asignada).toBe(false);
    expect(resultado.stockFaltante).toEqual(["prod-001"]);
  });
});
