import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { seedBaseRemitente, seedAdmin, seedProductos, limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

describe("Server Actions - Solicitudes", () => {
  beforeEach(async () => {
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  describe("crearSolicitudAction", () => {
    it("crea una solicitud como solicitante autenticado", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-solicitante-1",
        sessionClaims: { metadata: { rol: "solicitante" } },
      });
      const idBase = await seedBaseRemitente(prisma, { id: "base-default-id" });
      const { prod1 } = await seedProductos(prisma, idBase);

      const { crearSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const result = await crearSolicitudAction({
        ubicacion_destino: { lat: -34.6037, lng: -58.3816 },
        prioridad: "Media",
        productos: [{ productoId: prod1.id_producto, cantidad: 5 }],
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const solicitudes = await prisma.solicitud.findMany();
      expect(solicitudes).toHaveLength(1);
      expect(solicitudes[0].prioridad).toBe("Media");
    });

    it("rechaza si el rol no es solicitante", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { crearSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const result = await crearSolicitudAction({
        ubicacion_destino: { lat: -34.6037, lng: -58.3816 },
        prioridad: "Media",
        productos: [{ productoId: "prod-1", cantidad: 5 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });

    it("rechaza si no hay userId", async () => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

      const { crearSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const result = await crearSolicitudAction({
        ubicacion_destino: { lat: -34.6037, lng: -58.3816 },
        prioridad: "Media",
        productos: [{ productoId: "prod-1", cantidad: 5 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });
  });

  describe("asignarRemitenteAction", () => {
    it("asigna un remitente a una solicitud como admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const { idSolicitud } = await crearSolicitudConFixture(prisma, "Creada");
      const idRemitente = await seedBaseRemitente(prisma);

      const { asignarRemitenteAction } = await import("@/src/actions/solicitudes.actions");
      const formData = new FormData();
      formData.set("remitenteId", idRemitente);
      const result = await asignarRemitenteAction(idSolicitud, formData);

      expect(result.success).toBe(true);

      const solicitud = await prisma.solicitud.findUnique({ where: { id_solicitud: idSolicitud } });
      expect(solicitud?.id_remitente).toBe(idRemitente);
    });

    it("rechaza si el rol no es admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-remitente-1",
        sessionClaims: { metadata: { rol: "remitente" } },
      });

      const { asignarRemitenteAction } = await import("@/src/actions/solicitudes.actions");
      const formData = new FormData();
      formData.set("remitenteId", "some-id");
      const result = await asignarRemitenteAction("solicitud-id", formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autorizado");
    });

    it("rechaza si no se selecciona remitente", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });

      const { asignarRemitenteAction } = await import("@/src/actions/solicitudes.actions");
      const formData = new FormData();
      const result = await asignarRemitenteAction("solicitud-id", formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("anularSolicitudAction", () => {
    it("anula una solicitud como admin", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-admin-1",
        sessionClaims: { metadata: { rol: "admin" } },
      });
      const { idSolicitud } = await crearSolicitudConFixture(prisma, "Asignada");

      const { anularSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const formData = new FormData();
      formData.set("motivo", "Test anulación");
      const result = await anularSolicitudAction(idSolicitud, formData);

      expect(result.success).toBe(true);

      const solicitud = await prisma.solicitud.findUnique({ where: { id_solicitud: idSolicitud } });
      expect(solicitud?.estado_actual).toBe("Anulada");
    });
  });

  describe("cancelarSolicitudAction", () => {
    it("cancela una solicitud propia como solicitante", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-user-1",
        sessionClaims: { metadata: { rol: "solicitante" } },
      });
      const { idSolicitud, idUsuario } = await crearSolicitudConFixture(prisma, "Creada");
      mockAuth.mockResolvedValue({
        userId: idUsuario,
        sessionClaims: { metadata: { rol: "solicitante" } },
      });

      const { cancelarSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const result = await cancelarSolicitudAction(idSolicitud, "Cambié de opinión");

      expect(result.success).toBe(true);

      const solicitud = await prisma.solicitud.findUnique({ where: { id_solicitud: idSolicitud } });
      expect(solicitud?.estado_actual).toBe("Cancelada");
    });
  });

  describe("consultarSolicitudAction", () => {
    it("retorna la solicitud para el solicitante propietario", async () => {
      const { idSolicitud, idUsuario } = await crearSolicitudConFixture(prisma, "Creada");
      mockAuth.mockResolvedValue({
        userId: idUsuario,
        sessionClaims: { metadata: { rol: "solicitante" } },
      });

      const { consultarSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const result = await consultarSolicitudAction(idSolicitud);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("retorna error si no autenticado", async () => {
      mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

      const { consultarSolicitudAction } = await import("@/src/actions/solicitudes.actions");
      const result = await consultarSolicitudAction("some-id");

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autenticado");
    });
  });

  describe("obtenerProductosAction", () => {
    it("lista productos del catálogo", async () => {
      mockAuth.mockResolvedValue({
        userId: "test-user-1",
        sessionClaims: { metadata: { rol: "solicitante" } },
      });
      await seedProductos(prisma);

      const { obtenerProductosAction } = await import("@/src/actions/solicitudes.actions");
      const result = await obtenerProductosAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data!.length).toBeGreaterThan(0);
    });
  });
});

async function crearSolicitudConFixture(prisma: PrismaClient, estado: string) {
  const idUsuario = crypto.randomUUID();
  const idSolicitud = crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: idUsuario,
      estado_cuenta: "APROBADA",
      solicitante: {
        create: {
          id_solicitante: idUsuario,
          nombre: "Solicitante Test",
          contacto: "test@test.com",
        },
      },
    },
  });

  await prisma.solicitud.create({
    data: {
      id_solicitud: idSolicitud,
      estado_actual: estado,
      prioridad: "Media",
      latitud_destino: -38.7,
      longitud_destino: -62.27,
      id_solicitante: idUsuario,
    },
  });

  return { idUsuario, idSolicitud };
}
