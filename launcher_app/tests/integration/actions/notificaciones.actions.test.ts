import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Notificaciones", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("obtenerNotificacionesAction", () => {
    it("retorna notificaciones del usuario autenticado", async () => {
      const userId = crypto.randomUUID();
      const idSolicitud = crypto.randomUUID();

      await prisma.usuario.create({
        data: {
          id_usuario: userId,
          estado_cuenta: "APROBADA",
          solicitante: { create: { nombre: "Test", contacto: "t@t.com" } },
        },
      });

      await prisma.solicitud.create({
        data: {
          id_solicitud: idSolicitud,
          estado_actual: "Creada",
          prioridad: "Media",
          latitud_destino: -38.7,
          longitud_destino: -62.27,
          id_solicitante: userId,
        },
      });

      await prisma.notificacion.create({
        data: {
          mensaje: "Test notificación",
          id_solicitud: idSolicitud,
          id_usuario_destino: userId,
        },
      });

      mockAuth.mockResolvedValue({ userId, sessionClaims: { metadata: { rol: "solicitante" } } });

      const { obtenerNotificacionesAction } = await import("@/src/actions/notificaciones.actions");
      const result = await obtenerNotificacionesAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(1);
    });

    it("rechaza si no autenticado", async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const { obtenerNotificacionesAction } = await import("@/src/actions/notificaciones.actions");
      const result = await obtenerNotificacionesAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });

  describe("listarNotificacionesGlobalAction", () => {
    it("lista todas las notificaciones para admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const userId = crypto.randomUUID();
      const idSolicitud = crypto.randomUUID();

      await prisma.usuario.create({
        data: {
          id_usuario: userId,
          estado_cuenta: "APROBADA",
          solicitante: { create: { nombre: "Test", contacto: "t@t.com" } },
        },
      });

      await prisma.solicitud.create({
        data: {
          id_solicitud: idSolicitud,
          estado_actual: "Creada",
          prioridad: "Media",
          latitud_destino: -38.7,
          longitud_destino: -62.27,
          id_solicitante: userId,
        },
      });

      await prisma.notificacion.create({
        data: {
          mensaje: "Notificación global",
          id_solicitud: idSolicitud,
          id_usuario_destino: userId,
        },
      });

      const { listarNotificacionesGlobalAction } = await import("@/src/actions/notificaciones.actions");
      const result = await listarNotificacionesGlobalAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.paginacion).toBeDefined();
    });

    it("rechaza si no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { listarNotificacionesGlobalAction } = await import("@/src/actions/notificaciones.actions");
      const result = await listarNotificacionesGlobalAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });
});
