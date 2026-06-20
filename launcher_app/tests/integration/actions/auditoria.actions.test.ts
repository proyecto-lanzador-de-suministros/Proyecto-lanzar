import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Auditoría", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("listarAuditoriaAction", () => {
    it("lista el historial paginado para admin", async () => {
      const idUsuario = crypto.randomUUID();
      const idSolicitud = crypto.randomUUID();

      await prisma.usuario.create({
        data: {
          id_usuario: idUsuario,
          estado_cuenta: "APROBADA",
          solicitante: { create: { id_solicitante: idUsuario, nombre: "Test", contacto: "t@t.com" } },
        },
      });

      await prisma.solicitud.create({
        data: {
          id_solicitud: idSolicitud,
          estado_actual: "Creada",
          prioridad: "Media",
          latitud_destino: -38.7,
          longitud_destino: -62.27,
          id_solicitante: idUsuario,
        },
      });

      await prisma.historial_Estado.create({
        data: {
          id_solicitud: idSolicitud,
          id_usuario: idUsuario,
          estado_anterior: "Pendiente",
          estado_nuevo: "Creada",
        },
      });

      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });

      const { listarAuditoriaAction } = await import("@/src/actions/auditoria.actions");
      const result = await listarAuditoriaAction({ pagina: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.paginacion).toBeDefined();
    });

    it("rechaza si no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { listarAuditoriaAction } = await import("@/src/actions/auditoria.actions");
      const result = await listarAuditoriaAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });
});
