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
      const { idBase, idRemitente } = await seedBaseRemitente(prisma);

      const { actualizarBaseRemitenteAction } = await import("@/src/actions/remitentes.actions");
      const result = await actualizarBaseRemitenteAction(idRemitente, {
        nombre: "Base Actualizada",
        latitud: -34.6037,
        longitud: -58.3816,
      });

      expect(result.success).toBe(true);

      const base = await prisma.base.findUnique({ where: { id_base: idBase } });
      expect(base?.nombre).toBe("Base Actualizada");
      expect(base?.latitud).toBe(-34.6037);
    });
  });
});
