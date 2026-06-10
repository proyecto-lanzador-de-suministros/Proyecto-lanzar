import { describe, it, expect } from "vitest";
import { CrearSolicitud } from "../CrearSolicitud.usecase";
import { MockSolicitudesRepository } from "@/src/modules/solicitudes/infrastructure/adapters/MockSolicitudesRepository";

describe("CrearSolicitud", () => {
  it("crea una solicitud con estado creada", async () => {
    const repo = new MockSolicitudesRepository();
    const useCase = new CrearSolicitud(repo);

    const solicitud = await useCase.ejecutar({
      id_base: "base-1",
      id_usuario: "user-1",
      prioridad: "media",
      ubicacion_destino: { type: "Point", coordinates: [-58.3816, -34.6037] },
      fecha_entrega: new Date("2026-06-15"),
    });

    expect(solicitud.estado).toBe("creada");
    expect(solicitud.id_solicitud).toBeDefined();
  });

  it("persiste la solicitud en el repositorio", async () => {
    const repo = new MockSolicitudesRepository();
    const useCase = new CrearSolicitud(repo);

    const solicitud = await useCase.ejecutar({
      id_base: "base-1",
      id_usuario: "user-1",
      prioridad: "media",
      ubicacion_destino: { type: "Point", coordinates: [-58.3816, -34.6037] },
      fecha_entrega: new Date("2026-06-15"),
    });

    const encontrada = await repo.buscarPorId(solicitud.id_solicitud);
    expect(encontrada).not.toBeNull();
  });
});
