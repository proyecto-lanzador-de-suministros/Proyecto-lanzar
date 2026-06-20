import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { seedBaseRemitente, seedProductos, limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Reportes", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("obtenerReporteSolicitudesAction", () => {
    it("retorna reporte de solicitudes para admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const idUsuario = crypto.randomUUID();

      await prisma.usuario.create({
        data: {
          id_usuario: idUsuario,
          estado_cuenta: "APROBADA",
          solicitante: { create: { id_solicitante: idUsuario, nombre: "Test", contacto: "t@t.com" } },
        },
      });

      await prisma.solicitud.create({
        data: {
          id_solicitud: crypto.randomUUID(),
          estado_actual: "Creada",
          prioridad: "Media",
          latitud_destino: -38.7,
          longitud_destino: -62.27,
          id_solicitante: idUsuario,
        },
      });

      const { obtenerReporteSolicitudesAction } = await import("@/src/actions/reportes.actions");
      const result = await obtenerReporteSolicitudesAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.resumen).toBeDefined();
      expect(result.resumen!.total).toBe(1);
    });

    it("rechaza si no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { obtenerReporteSolicitudesAction } = await import("@/src/actions/reportes.actions");
      const result = await obtenerReporteSolicitudesAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });

  describe("obtenerReporteStockAction", () => {
    it("retorna reporte de stock para admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const idBase = await seedBaseRemitente(prisma);
      await seedProductos(prisma, idBase);

      const { obtenerReporteStockAction } = await import("@/src/actions/reportes.actions");
      const result = await obtenerReporteStockAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });
  });
});
