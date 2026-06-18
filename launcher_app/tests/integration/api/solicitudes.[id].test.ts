//solicitudes.[id].test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/container", () => ({
  consultarSolicitudUseCase: { ejecutar: vi.fn() },
}));

import { auth } from "@clerk/nextjs/server";
import { consultarSolicitudUseCase } from "@/src/container";
import { GET } from "@/app/api/solicitudes/[id]/route";
import {
  EstadoSolicitud,
  PrioridadSolicitud,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockEjecutar =
  consultarSolicitudUseCase.ejecutar as unknown as ReturnType<typeof vi.fn>;

function crearRequest(id: string): Request {
  return new Request(`http://localhost/api/solicitudes/${id}`);
}

function crearParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const solicitudValida = {
  id_solicitud: "solicitud-123",
  id_usuario: "user-1",
  estado: EstadoSolicitud.Creada,
  prioridad: PrioridadSolicitud.Media,
  ubicacion_destino: { lat: -34.6037, lng: -58.3816 },
  productos: [{ productoId: "prod-1", cantidad: 5 }],
  fecha_solicitada: new Date("2026-06-18").toISOString(),
  fechaActualizacion: new Date("2026-06-18").toISOString(),
};

describe("GET /api/solicitudes/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 401 si no hay userId", async () => {
    mockAuth.mockResolvedValue({ userId: null, sessionClaims: null });

    const res = await GET(crearRequest("123"), crearParams("123"));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("retorna 200 con los datos de la solicitud si el solicitante es el dueño", async () => {
    mockAuth.mockResolvedValue({
      userId: "user-1",
      sessionClaims: { metadata: { rol: "solicitante" } },
    });
    mockEjecutar.mockResolvedValue(solicitudValida);

    const res = await GET(
      crearRequest("solicitud-123"),
      crearParams("solicitud-123"),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id_solicitud).toBe("solicitud-123");
    expect(body.estado).toBe(EstadoSolicitud.Creada);
  });

  it("retorna 403 si un solicitante intenta ver una solicitud ajena", async () => {
    mockAuth.mockResolvedValue({
      userId: "user-2",
      sessionClaims: { metadata: { rol: "solicitante" } },
    });
    mockEjecutar.mockRejectedValue(
      new Error("No tenés permiso para consultar esta solicitud."),
    );

    const res = await GET(
      crearRequest("solicitud-123"),
      crearParams("solicitud-123"),
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("retorna 404 si la solicitud no existe", async () => {
    mockAuth.mockResolvedValue({
      userId: "user-1",
      sessionClaims: { metadata: { rol: "solicitante" } },
    });
    mockEjecutar.mockRejectedValue(new Error("Solicitud no encontrada."));

    const res = await GET(
      crearRequest("inexistente"),
      crearParams("inexistente"),
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("retorna 200 si admin accede a cualquier solicitud", async () => {
    mockAuth.mockResolvedValue({
      userId: "admin-1",
      sessionClaims: { metadata: { rol: "admin" } },
    });
    mockEjecutar.mockResolvedValue(solicitudValida);

    const res = await GET(
      crearRequest("solicitud-123"),
      crearParams("solicitud-123"),
    );

    expect(res.status).toBe(200);
  });

  it("retorna 500 para errores inesperados", async () => {
    mockAuth.mockResolvedValue({
      userId: "user-1",
      sessionClaims: { metadata: { rol: "solicitante" } },
    });
    mockEjecutar.mockRejectedValue(new Error("Error de conexión"));

    const res = await GET(crearRequest("123"), crearParams("123"));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
