import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Admin Remitentes (Crear)", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("crearBaseRemitenteAction", () => {
    it("crea una base remitente como admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });

      const { crearBaseRemitenteAction } = await import("@/src/actions/remitentes.actions");
      const result = await crearBaseRemitenteAction({
        email: "base@test.com",
        password: "password123",
        nombreContacto: "Contacto Test",
        nombreBase: "Base Nueva",
        latitudBase: -34.6037,
        longitudBase: -58.3816,
        capacidadPista: "Grande",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBeDefined();

      const base = await prisma.base.findFirst({
        where: { nombre: "Base Nueva" },
      });
      expect(base).not.toBeNull();
      expect(base!.latitud).toBe(-34.6037);
      expect(base!.longitud).toBe(-58.3816);
      expect(base!.capacidad_pista).toBe("Grande");

      const remitente = await prisma.remitente.findFirst({
        where: { id_base: base!.id_base },
      });
      expect(remitente).not.toBeNull();

      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: remitente!.id_remitente },
      });
      expect(usuario).not.toBeNull();
      expect(usuario!.estado_cuenta).toBe("APROBADA");
    });

    it("rechaza si no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { crearBaseRemitenteAction } = await import("@/src/actions/remitentes.actions");
      const result = await crearBaseRemitenteAction({
        email: "base@test.com",
        password: "password123",
        nombreContacto: "Contacto",
        nombreBase: "Base",
        latitudBase: -34,
        longitudBase: -58,
        capacidadPista: "Grande",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });

    it("rechaza si no autenticado", async () => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

      const { crearBaseRemitenteAction } = await import("@/src/actions/remitentes.actions");
      const result = await crearBaseRemitenteAction({
        email: "base@test.com",
        password: "password123",
        nombreContacto: "Contacto",
        nombreBase: "Base",
        latitudBase: -34,
        longitudBase: -58,
        capacidadPista: "Grande",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });
});
