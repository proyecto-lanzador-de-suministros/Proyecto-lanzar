import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@clerk/nextjs/server";
import { GET as GET_Solicitudes } from "@/app/api/solicitudes/route";
import { GET as GET_Historial } from "@/app/api/solicitudes/[id]/historial/route";
import { GET as GET_Usuarios } from "@/app/api/usuarios/route";
import { GET as GET_Stock, PUT as PUT_Stock } from "@/app/api/bases/[id]/stock/route";
import { GET as GET_Envios, POST as POST_Envios } from "@/app/api/envios/route";
import { POST as POST_Contenedores } from "@/app/api/envios/[id]/contenedores/route";
import { crearPrismaTest } from "../../prisma-test-client";
import { PrismaClient } from "@/src/generated/prisma";
import { limpiarBase } from "../../fixtures/solicitud.fixture";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
let prisma: PrismaClient;

function crearRequest(url: string, body?: unknown): Request {
  const init: RequestInit & { headers?: Record<string, string> } = {};
  if (body !== undefined) {
    init.method = "POST";
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(`http://localhost${url}`, init);
}

function crearParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(async () => {
  vi.clearAllMocks();
  prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
  await limpiarBase(prisma);
});

afterEach(async () => {
  await limpiarBase(prisma);
  await prisma.$disconnect();
});

describe("GET /api/solicitudes", () => {
  it("retorna 401 sin autenticación", async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });
    const res = await GET_Solicitudes(crearRequest("/solicitudes"));
    expect(res.status).toBe(401);
  });

  it("retorna lista vacía para solicitante sin solicitudes", async () => {
    const idUsuario = crypto.randomUUID();
    await prisma.usuario.create({
      data: { id_usuario: idUsuario, estado_cuenta: "APROBADA", solicitante: { create: { nombre: "Test", contacto: "t@t.com" } } },
    });
    mockAuth.mockResolvedValue({ userId: idUsuario, sessionClaims: { metadata: { rol: "solicitante" } } });
    const res = await GET_Solicitudes(crearRequest("/solicitudes"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });
});

describe("GET /api/solicitudes/[id]/historial", () => {
  it("retorna 401 sin autenticación", async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });
    const res = await GET_Historial(crearRequest("/solicitudes/123/historial"), crearParams("123"));
    expect(res.status).toBe(401);
  });

  it("retorna historial vacío para solicitud sin eventos", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();
    await prisma.usuario.create({
      data: { id_usuario: idUsuario, estado_cuenta: "APROBADA", solicitante: { create: { nombre: "Test", contacto: "t@t.com" } } },
    });
    await prisma.solicitud.create({
      data: { id_solicitud: idSolicitud, estado_actual: "Creada", prioridad: "Media", latitud_destino: -38.7, longitud_destino: -62.27, id_solicitante: idUsuario },
    });
    mockAuth.mockResolvedValue({ userId: idUsuario, sessionClaims: { metadata: { rol: "solicitante" } } });
    const res = await GET_Historial(crearRequest(`/solicitudes/${idSolicitud}/historial`), crearParams(idSolicitud));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  it("retorna entries del historial con formato correcto", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();
    await prisma.usuario.create({
      data: { id_usuario: idUsuario, estado_cuenta: "APROBADA", solicitante: { create: { nombre: "Test", contacto: "t@t.com" } } },
    });
    await prisma.solicitud.create({
      data: { id_solicitud: idSolicitud, estado_actual: "Creada", prioridad: "Media", latitud_destino: -38.7, longitud_destino: -62.27, id_solicitante: idUsuario },
    });
    await prisma.historial_Estado.create({
      data: { id_solicitud: idSolicitud, id_usuario: idUsuario, estado_anterior: null, estado_nuevo: "Creada" },
    });
    mockAuth.mockResolvedValue({ userId: idUsuario, sessionClaims: { metadata: { rol: "solicitante" } } });
    const res = await GET_Historial(crearRequest(`/solicitudes/${idSolicitud}/historial`), crearParams(idSolicitud));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("fechaHora");
    expect(body[0]).toHaveProperty("estadoNuevo", "Creada");
    expect(body[0]).toHaveProperty("usuarioId", idUsuario);
  });
});

describe("GET /api/envios", () => {
  it("retorna 401 sin autenticación", async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });
    const res = await GET_Envios(crearRequest("/envios"));
    expect(res.status).toBe(401);
  });

  it("retorna lista vacía para admin sin envíos", async () => {
    mockAuth.mockResolvedValue({ userId: "admin-1", sessionClaims: { metadata: { rol: "admin" } } });
    const res = await GET_Envios(crearRequest("/envios"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe("POST /api/envios", () => {
  it("retorna 201 y crea un envío", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();
    const idBase = crypto.randomUUID();
    await prisma.usuario.create({
      data: { id_usuario: idUsuario, estado_cuenta: "APROBADA", administrador: { create: { nombre: "Admin", usuario: "admin", permisos_rol: "admin" } } },
    });
    await prisma.solicitud.create({
      data: { id_solicitud: idSolicitud, estado_actual: "Asignada", prioridad: "Alta", latitud_destino: -38.7, longitud_destino: -62.27, id_solicitante: idUsuario },
    });
    await prisma.base.create({
      data: { id_base: idBase, nombre: "Base Test", latitud: -38.7, longitud: -62.27, direccion: "Test" },
    });
    mockAuth.mockResolvedValue({ userId: idUsuario, sessionClaims: { metadata: { rol: "admin" } } });
    const res = await POST_Envios(crearRequest("/envios", { id_solicitud: idSolicitud, id_base: idBase }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("estado", "programado");
  });
});

describe("POST /api/envios/[id]/contenedores", () => {
  it("retorna 201 y asigna contenedor", async () => {
    const idUsuario = crypto.randomUUID();
    const idSolicitud = crypto.randomUUID();
    const idBase = crypto.randomUUID();
    const idEnvio = crypto.randomUUID();
    await prisma.usuario.create({
      data: { id_usuario: idUsuario, estado_cuenta: "APROBADA", administrador: { create: { nombre: "Admin", usuario: "admin", permisos_rol: "admin" } } },
    });
    await prisma.base.create({ data: { id_base: idBase, nombre: "Base", latitud: -38.7, longitud: -62.27, direccion: "Test" } });
    await prisma.solicitud.create({
      data: { id_solicitud: idSolicitud, estado_actual: "Asignada", prioridad: "Alta", latitud_destino: -38.7, longitud_destino: -62.27, id_solicitante: idUsuario },
    });
    await prisma.envio.create({
      data: { id_envio: idEnvio, id_solicitud: idSolicitud, id_base: idBase, estado_envio: "programado" },
    });
    mockAuth.mockResolvedValue({ userId: idUsuario, sessionClaims: { metadata: { rol: "admin" } } });
    const res = await POST_Contenedores(
      crearRequest(`/envios/${idEnvio}/contenedores`, { tipoParacaidas: "Circular", pesoMax: 150 }),
      crearParams(idEnvio),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body.tipoParacaidas).toBe("Circular");
    expect(body.pesoMax).toBe(150);
    expect(body.envioId).toBe(idEnvio);
  });
});
