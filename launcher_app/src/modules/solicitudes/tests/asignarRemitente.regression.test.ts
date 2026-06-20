import { describe, it, expect, vi, beforeEach } from "vitest";
import { AsignarRemitenteUseCase } from "@/src/modules/solicitudes/domain/use-cases/AsignarRemitente.usecase";
import {
  Solicitud,
  EstadoSolicitud,
  PrioridadSolicitud,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";

// Solicitud existente en estado Creada — simula lo que vendría de DB
const solicitudExistente = Solicitud.reconstruir({
  id_solicitud: "solicitud-123",
  id_usuario: "usuario-456",
  ubicacion_destino: { type: "Point", coordinates: [-62.27, -38.7] },
  prioridad: PrioridadSolicitud.Media,
  productos: [{ productoId: "producto-1", cantidad: 2 }],
  estado: EstadoSolicitud.Creada,
  fecha_solicitada: new Date(),
  fechaActualizacion: new Date(),
});

const remitenteAprobado = {
  id: "remitente-789",
  rol: "REMITENTE" as const,
  estadoCuenta: "APROBADA" as const,
  nombre: "Remitente Test",
};

describe("AsignarRemitenteUseCase — regresión persistencia", () => {
  let solicitudRepo: any;
  let usuarioRepo: any;
  let notifier: any;
  let historial: any;
  let useCase: AsignarRemitenteUseCase;

  beforeEach(() => {
    solicitudRepo = {
      buscarPorId: vi.fn().mockResolvedValue(solicitudExistente),
      guardar: vi.fn(),
      actualizar: vi.fn(),
    };
    usuarioRepo = {
      buscarPorId: vi.fn().mockResolvedValue(remitenteAprobado),
    };
    notifier = { notificar: vi.fn() };
    historial = { registrar: vi.fn() };

    useCase = new AsignarRemitenteUseCase(
      solicitudRepo,
      usuarioRepo,
      notifier,
      historial,
    );
  });

  it("llama actualizar y no guardar al asignar remitente a solicitud existente", async () => {
    await useCase.ejecutar("solicitud-123", "remitente-789", "admin-001");

    expect(solicitudRepo.actualizar).toHaveBeenCalledOnce();
    expect(solicitudRepo.guardar).not.toHaveBeenCalled();
  });

  it("persiste la solicitud en estado Asignada", async () => {
    await useCase.ejecutar("solicitud-123", "remitente-789", "admin-001");

    const solicitudPersistida = solicitudRepo.actualizar.mock
      .calls[0][0] as Solicitud;
    expect(solicitudPersistida.estado).toBe(EstadoSolicitud.Asignada);
  });
});
