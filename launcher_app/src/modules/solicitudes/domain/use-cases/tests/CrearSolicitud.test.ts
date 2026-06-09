import { describe, it, expect } from "vitest";
import { CrearSolicitud } from "../CrearSolicitud.usecase";
import { MockSolicitudesRepository } from "@/modules/solicitudes/infrastructure/adapters/MockSolicitudesRepository";

describe("CrearSolicitud", () => {
  it("crea una solicitud con estado pendiente", async () => {
    const repo = new MockSolicitudesRepository();
    const useCase = new CrearSolicitud(repo);

    const solicitud = await useCase.ejecutar({
      remitente: "user-1",
      solicitante: "user-2",
      descripcion: "Enviar paquete",
    });

    expect(solicitud.estado).toBe("pendiente");
    expect(solicitud.id).toBeDefined();
  });

  it("persiste la solicitud en el repositorio", async () => {
    const repo = new MockSolicitudesRepository();
    const useCase = new CrearSolicitud(repo);

    const solicitud = await useCase.ejecutar({
      remitente: "user-1",
      solicitante: "user-2",
      descripcion: "Enviar paquete",
    });

    const encontrada = await repo.buscarPorId(solicitud.id);
    expect(encontrada).not.toBeNull();
  });
});
