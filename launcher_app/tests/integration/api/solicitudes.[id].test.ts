import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { auth } from "@clerk/nextjs/server";
import { GET } from "@/app/api/solicitudes/[id]/route";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

function crearRequest(id: string): Request {
  return new Request(`http://localhost/api/solicitudes/${id}`);
}

function crearParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/solicitudes/[id]", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  it("retorna 401 si no hay userId", async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

    const res = await GET(crearRequest("123"), crearParams("123"));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("retorna 200 con los datos de la solicitud si el solicitante es el dueño", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();

    await prisma.usuario.create({
      data: {
        id_usuario: idUsuario,
        estado_cuenta: "APROBADA",
          solicitante: {
            create: { nombre: "Test", contacto: "t@t.com" },
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
      userId: idUsuario,
      sessionClaims: { metadata: { rol: "solicitante" } },
    });

    const res = await GET(crearRequest(idSolicitud), crearParams(idSolicitud));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id_solicitud).toBe(idSolicitud);
  });

  it("retorna 403 si un solicitante intenta ver una solicitud ajena", async () => {
    const idUsuario1 = crypto.randomUUID();
    const idUsuario2 = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();

    await prisma.usuario.create({
      data: {
        id_usuario: idUsuario1,
        estado_cuenta: "APROBADA",
        solicitante: {
          create: { nombre: "Dueño", contacto: "a@a.com" },
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
        id_solicitante: idUsuario1,
      },
    });

    mockAuth.mockResolvedValue({
      userId: idUsuario2,
      sessionClaims: { metadata: { rol: "solicitante" } },
    });

    const res = await GET(crearRequest(idSolicitud), crearParams(idSolicitud));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("PERMISO_DENEGADO");
  });

  it("retorna 404 si la solicitud no existe", async () => {
    mockAuth.mockResolvedValue({
      userId: "user-1",
      sessionClaims: { metadata: { rol: "solicitante" } },
    });

    const res = await GET(crearRequest("inexistente"), crearParams("inexistente"));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("SOLICITUD_NO_ENCONTRADA");
  });

  it("retorna 200 si admin accede a cualquier solicitud", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();

    await prisma.usuario.create({
      data: {
        id_usuario: idUsuario,
        estado_cuenta: "APROBADA",
          solicitante: {
            create: { nombre: "Test", contacto: "t@t.com" },
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

    const res = await GET(crearRequest(idSolicitud), crearParams(idSolicitud));

    expect(res.status).toBe(200);
  });
});
