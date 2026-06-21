import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { auth } from "@clerk/nextjs/server";
import { GET } from "@/app/api/admin/solicitudes/route";
import { crearPrismaTest } from "../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;

let prisma: PrismaClient;

function crearRequest(url?: string): Request {
  return new Request(url ?? "http://localhost/api/admin/solicitudes");
}

describe("GET /api/admin/solicitudes", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    await limpiarBase(prisma);
  });

  afterEach(async () => {
    await limpiarBase(prisma);
    await prisma.$disconnect();
  });

  it("retorna 403 si el rol no es admin", async () => {
    mockAuth.mockResolvedValue({
      userId: "remitente-1",
      sessionClaims: { metadata: { rol: "remitente" } },
    });

    const res = await GET(crearRequest());

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("retorna lista de solicitudes para admin", async () => {
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

    const res = await GET(crearRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBeInstanceOf(Array);
    expect(body).toHaveLength(1);
  });

  it("filtra solicitudes por estado", async () => {
    const idUsuario = crypto.randomUUID();

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
        id_solicitud: crypto.randomUUID(),
        estado_actual: "Creada",
        prioridad: "Media",
        latitud_destino: -38.7,
        longitud_destino: -62.27,
        id_solicitante: idUsuario,
      },
    });

    await prisma.solicitud.create({
      data: {
        id_solicitud: crypto.randomUUID(),
        estado_actual: "Asignada",
        prioridad: "Alta",
        latitud_destino: -38.7,
        longitud_destino: -62.27,
        id_solicitante: idUsuario,
      },
    });

    mockAuth.mockResolvedValue({
      userId: "admin-1",
      sessionClaims: { metadata: { rol: "admin" } },
    });

    const res = await GET(crearRequest("http://localhost/api/admin/solicitudes?estado=Creada"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].estado).toBe("Creada");
  });
});
