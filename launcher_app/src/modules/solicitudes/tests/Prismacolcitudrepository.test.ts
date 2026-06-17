import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaSolicitudesRepository } from "../infrastructure/adapters/PrismaSolicitudRepository";
import {
  EstadoSolicitud,
  PrioridadSolicitud,
  Solicitud,
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
// Tipado para que TS no se queje al usar .mockResolvedValue
const prismaMock = prisma as unknown as {
  solicitud: {
    create: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};
// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fila mínima que devolvería Prisma (sin detalles) */
function rowBase() {
  return {
    id_solicitud: "sol-001",
    id_solicitante: "usr-001",
    id_remitente: null,
    latitud_destino: -38.7,
    longitud_destino: -62.3,
    prioridad: PrioridadSolicitud.Media,
    estado_actual: EstadoSolicitud.Creada,
    fecha_creacion: new Date("2026-01-01"),
    motivo_cancelacion: null,
    motivo_anulacion: null,
    detalles: [],
  };
}

/** Solicitud de dominio mínima para guardar */
function solicitudDeDominio(): Solicitud {
  return Solicitud.crear({
    id_solicitud: "sol-001",
    id_usuario: "usr-001",
    ubicacion_destino: { type: "Point", coordinates: [-62.3, -38.7] },
    prioridad: PrioridadSolicitud.Media,
    productos: [{ productoId: "prod-001", cantidad: 2 }],
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("PrismaSolicitudesRepository", () => {
  let repo: PrismaSolicitudesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaSolicitudesRepository();
  });

  // ── guardar ────────────────────────────────────────────────────────────────

  describe("guardar", () => {
    it("llama a prisma con los datos correctos al guardar una solicitud nueva", async () => {
      prismaMock.solicitud.create.mockResolvedValue(undefined);

      const solicitud = solicitudDeDominio();
      await repo.guardar(solicitud);

      expect(prismaMock.solicitud.create).toHaveBeenCalledOnce();
      expect(prismaMock.solicitud.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id_solicitud: "sol-001",
          id_solicitante: "usr-001",
          estado_actual: EstadoSolicitud.Creada,
          prioridad: PrioridadSolicitud.Media,
          latitud_destino: -38.7,
          longitud_destino: -62.3,
        }),
      });
    });
  });

  // ── buscarPorId ────────────────────────────────────────────────────────────

  describe("buscarPorId", () => {
    it("retorna una entidad Solicitud cuando Prisma encuentra la fila", async () => {
      prismaMock.solicitud.findUnique.mockResolvedValue(rowBase());

      const resultado = await repo.buscarPorId("sol-001");

      expect(resultado).toBeInstanceOf(Solicitud);
      expect(resultado?.id_solicitud).toBe("sol-001");
      expect(resultado?.id_usuario).toBe("usr-001");
      expect(resultado?.estado).toBe(EstadoSolicitud.Creada);
    });

    it("retorna null cuando Prisma no encuentra la fila", async () => {
      prismaMock.solicitud.findUnique.mockResolvedValue(null);

      const resultado = await repo.buscarPorId("no-existe");

      expect(resultado).toBeNull();
    });

    it("mapea detalles a productos correctamente", async () => {
      prismaMock.solicitud.findUnique.mockResolvedValue({
        ...rowBase(),
        detalles: [
          { id_producto: "prod-001", cantidad_pedida: 3 },
          { id_producto: "prod-002", cantidad_pedida: 1 },
        ],
      });

      const resultado = await repo.buscarPorId("sol-001");

      expect(resultado?.productos).toHaveLength(2);
      expect(resultado?.productos[0]).toEqual({
        productoId: "prod-001",
        cantidad: 3,
      });
      expect(resultado?.productos[1]).toEqual({
        productoId: "prod-002",
        cantidad: 1,
      });
    });
  });

  // ── listarPorSolicitante ───────────────────────────────────────────────────

  describe("listarPorSolicitante", () => {
    it("retorna array de solicitudes del usuario", async () => {
      prismaMock.solicitud.findMany.mockResolvedValue([rowBase(), rowBase()]);

      const resultado = await repo.listarPorSolicitante("usr-001");

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toBeInstanceOf(Solicitud);
    });

    it("retorna array vacío si el usuario no tiene solicitudes", async () => {
      prismaMock.solicitud.findMany.mockResolvedValue([]);

      const resultado = await repo.listarPorSolicitante("usr-sin-solicitudes");

      expect(resultado).toEqual([]);
    });
  });

  // ── listarTodas ────────────────────────────────────────────────────────────

  describe("listarTodas", () => {
    it("lista todas las solicitudes sin filtro", async () => {
      prismaMock.solicitud.findMany.mockResolvedValue([rowBase()]);

      const resultado = await repo.listarTodas();

      expect(prismaMock.solicitud.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      );
      expect(resultado).toHaveLength(1);
    });

    it("filtra por estado cuando se pasa estadoFiltro", async () => {
      prismaMock.solicitud.findMany.mockResolvedValue([]);

      await repo.listarTodas(EstadoSolicitud.Asignada);

      expect(prismaMock.solicitud.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado_actual: EstadoSolicitud.Asignada },
        }),
      );
    });
  });

  // ── actualizarEstado ───────────────────────────────────────────────────────

  describe("actualizarEstado", () => {
    it("actualiza el estado correctamente", async () => {
      prismaMock.solicitud.update.mockResolvedValue(undefined);

      await repo.actualizarEstado("sol-001", EstadoSolicitud.Asignada);

      expect(prismaMock.solicitud.update).toHaveBeenCalledWith({
        where: { id_solicitud: "sol-001" },
        data: expect.objectContaining({
          estado_actual: EstadoSolicitud.Asignada,
        }),
      });
    });

    it("incluye motivo_cancelacion cuando se pasa en extras", async () => {
      prismaMock.solicitud.update.mockResolvedValue(undefined);

      await repo.actualizarEstado("sol-001", EstadoSolicitud.Cancelada, {
        motivoCancelacion: "Ya no se necesita",
      });

      expect(prismaMock.solicitud.update).toHaveBeenCalledWith({
        where: { id_solicitud: "sol-001" },
        data: expect.objectContaining({
          motivo_cancelacion: "Ya no se necesita",
        }),
      });
    });

    it("incluye id_remitente cuando se pasa id_base en extras", async () => {
      prismaMock.solicitud.update.mockResolvedValue(undefined);

      await repo.actualizarEstado("sol-001", EstadoSolicitud.Asignada, {
        id_base: "base-007",
      });

      expect(prismaMock.solicitud.update).toHaveBeenCalledWith({
        where: { id_solicitud: "sol-001" },
        data: expect.objectContaining({
          id_remitente: "base-007",
        }),
      });
    });
  });
});
