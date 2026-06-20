import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { seedBaseRemitente, seedAdmin, limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Remitentes", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("listarRemitentesAction", () => {
    it("lista todas las bases remitentes para admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      await seedBaseRemitente(prisma, { nombre_base: "Base Alpha" });
      await seedBaseRemitente(prisma, { nombre_base: "Base Beta" });

      const { listarRemitentesAction } = await import("@/src/actions/remitentes.actions");
      const result = await listarRemitentesAction();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("rechaza si no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { listarRemitentesAction } = await import("@/src/actions/remitentes.actions");
      const result = await listarRemitentesAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });

  describe("actualizarBaseRemitenteAction", () => {
    it("actualiza los datos de una base como admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const idBase = await seedBaseRemitente(prisma);

      const { actualizarBaseRemitenteAction } = await import("@/src/actions/remitentes.actions");
      const result = await actualizarBaseRemitenteAction(idBase, {
        nombre_base: "Base Actualizada",
        latitud_base: -34.6037,
        longitud_base: -58.3816,
      });

      expect(result.success).toBe(true);

      const remitente = await prisma.remitente.findUnique({ where: { id_remitente: idBase } });
      expect(remitente?.nombre_base).toBe("Base Actualizada");
      expect(remitente?.latitud_base).toBe(-34.6037);
    });
  });
});
