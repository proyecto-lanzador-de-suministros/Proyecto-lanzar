import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { seedBaseRemitente, seedProductos, limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Stock", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("listarBasesParaStockAction", () => {
    it("lista bases para admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      await seedBaseRemitente(prisma, { nombre_base: "Base A" });

      const { listarBasesParaStockAction } = await import("@/src/actions/stock.actions");
      const result = await listarBasesParaStockAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it("rechaza si no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { listarBasesParaStockAction } = await import("@/src/actions/stock.actions");
      const result = await listarBasesParaStockAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });

  describe("listarCatalogoProductosAction", () => {
    it("lista el catálogo de productos", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-user-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      await seedProductos(prisma);

      const { listarCatalogoProductosAction } = await import("@/src/actions/stock.actions");
      const result = await listarCatalogoProductosAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data!.length).toBeGreaterThan(0);
    });
  });

  describe("consultarStockBaseAction", () => {
    it("consulta stock de una base como admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const { idBase } = await seedBaseRemitente(prisma);
      await seedProductos(prisma, idBase);

      const { consultarStockBaseAction } = await import("@/src/actions/stock.actions");
      const result = await consultarStockBaseAction(idBase);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe("actualizarStockAction", () => {
    it("actualiza stock de un producto como admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const { idBase } = await seedBaseRemitente(prisma);
      const { prod1 } = await seedProductos(prisma, idBase);

      const { actualizarStockAction } = await import("@/src/actions/stock.actions");
      const result = await actualizarStockAction(idBase, prod1.id_producto, "absoluto", 200);

      expect(result.success).toBe(true);

      const stock = await prisma.stock_Base.findFirst({
        where: { id_base: idBase, id_producto: prod1.id_producto },
      });
      expect(stock?.cantidad_disponible).toBe(200);
    });
  });
});
