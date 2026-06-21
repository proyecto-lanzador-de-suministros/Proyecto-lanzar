import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnularSolicitudUseCase } from "@/src/modules/solicitudes/domain/use-cases/AnularSolicitud.usecase";
import {
  Solicitud,
  EstadoSolicitud,
  PrioridadSolicitud,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";

describe("AnularSolicitudUseCase — regresión persistencia", () => {
  let solicitudRepo: any;
  let notifier: any;
  let historial: any;
  let useCase: AnularSolicitudUseCase;

  beforeEach(() => {
    const solicitudExistente = Solicitud.reconstruir({
      id_solicitud: "solicitud-123",
      id_usuario: "usuario-456",
      ubicacion_destino: { type: "Point", coordinates: [-62.27, -38.7] },
      prioridad: PrioridadSolicitud.Media,
      productos: [{ productoId: "producto-1", cantidad: 2 }],
      estado: EstadoSolicitud.Asignada, // Anular requiere estar en un estado no terminal
      fecha_solicitada: new Date(),
      fechaActualizacion: new Date(),
    });
    solicitudRepo = {
      buscarPorId: vi.fn().mockResolvedValue(solicitudExistente),
      guardar: vi.fn(),
      actualizar: vi.fn(),
    };
    notifier = { notificar: vi.fn() };
    historial = { registrar: vi.fn() };

    useCase = new AnularSolicitudUseCase(solicitudRepo, notifier, historial);
  });

  it("llama actualizar y no guardar al anular solicitud existente", async () => {
    await useCase.ejecutar("solicitud-123", "Motivo de prueba", "admin-001");

    expect(solicitudRepo.actualizar).toHaveBeenCalledOnce();
    expect(solicitudRepo.guardar).not.toHaveBeenCalled();
  });

  it("persiste la solicitud en estado Anulada", async () => {
    await useCase.ejecutar("solicitud-123", "Motivo de prueba", "admin-001");

    const solicitudPersistida = solicitudRepo.actualizar.mock
      .calls[0][0] as Solicitud;
    expect(solicitudPersistida.estado).toBe(EstadoSolicitud.Anulada);
  });
});
