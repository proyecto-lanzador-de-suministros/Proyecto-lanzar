import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { auth } from "@clerk/nextjs/server";
import { PATCH } from "@/app/api/solicitudes/[id]/estado/route";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

function crearRequest(id: string, body: unknown): Request {
  return new Request(`http://localhost/api/solicitudes/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function crearParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/solicitudes/[id]/estado", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  it("retorna 403 si el rol no es admin ni remitente", async () => {
    mockAuth.mockResolvedValue({
      userId: "user-1",
      sessionClaims: { metadata: { rol: "solicitante" } },
    });

    const res = await PATCH(crearRequest("123", { nuevoEstado: "Asignada" }), crearParams("123"));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("retorna 400 si nuevoEstado no está presente", async () => {
    mockAuth.mockResolvedValue({
      userId: "admin-1",
      sessionClaims: { metadata: { rol: "admin" } },
    });

    const res = await PATCH(crearRequest("123", {}), crearParams("123"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("retorna 404 si la solicitud no existe", async () => {
    mockAuth.mockResolvedValue({
      userId: "admin-1",
      sessionClaims: { metadata: { rol: "admin" } },
    });

    const res = await PATCH(
      crearRequest("inexistente", { nuevoEstado: "Asignada" }),
      crearParams("inexistente"),
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("actualiza el estado de una solicitud como admin", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();

    await prisma.usuario.create({
      data: {
        id_usuario: idUsuario,
        estado_cuenta: "APROBADA",
        solicitante: {
          create: { id_solicitante: idUsuario, nombre: "Test", contacto: "t@t.com" },
        },
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

    mockAuth.mockResolvedValue({
      userId: "admin-1",
      sessionClaims: { metadata: { rol: "admin" } },
    });

    const res = await PATCH(
      crearRequest(idSolicitud, { nuevoEstado: "Cancelada" }),
      crearParams(idSolicitud),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe("Cancelada");
  });
});
