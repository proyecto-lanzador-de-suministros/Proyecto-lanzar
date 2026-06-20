import { describe, it, expect, vi, beforeEach } from "vitest";
import { Solicitud, EstadoSolicitud, PrioridadSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingSolicitudes } from "../domain/ports/forManagingSolicitudes.port";
import type { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import type { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import type { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";

import { RegistrarEnPreparacionUseCase } from "../domain/use-cases/RegistrarEnPreparacion.usecase";
import { RegistrarListaUseCase } from "../domain/use-cases/RegistrarLista.usecase";
import { RegistrarEnCaminoUseCase } from "../domain/use-cases/RegistrarEnCamino.usecase";
import { RegistrarLanzadaUseCase } from "../domain/use-cases/RegistrarLanzada.usecase";
import { ConfirmarRecibidaUseCase } from "../domain/use-cases/ConfirmarRecibida.usecase";
import { CancelarSolicitud } from "../domain/use-cases/CancelarSolicitud.usecase";
import { AnularSolicitudUseCase } from "../domain/use-cases/AnularSolicitud.usecase";

// =============================================================================
// Helpers
// =============================================================================

const baseProps = {
  id_solicitud: "sol-001",
  id_usuario: "usr-001",
  id_base: "rem-001",
  ubicacion_destino: { type: "Point" as const, coordinates: [-62.3, -38.7] as [number, number] },
  prioridad: PrioridadSolicitud.Media,
  productos: [{ productoId: "prod-001", cantidad: 2 }],
  fecha_solicitada: new Date("2026-01-01"),
  fechaActualizacion: new Date("2026-01-01"),
};

function solicitudEn(estado: EstadoSolicitud, extras?: Record<string, unknown>): Solicitud {
  return Solicitud.reconstruir({ ...baseProps, ...extras, estado });
}

function createMocks() {
  return {
    repo: {
      buscarPorId: vi.fn(),
      actualizarEstado: vi.fn(),
      guardar: vi.fn(),
      actualizar: vi.fn(),
      listarPendientes: vi.fn(),
      listarTodas: vi.fn(),
      listarPorSolicitante: vi.fn(),
      listarPorBase: vi.fn(),
    } satisfies Partial<ForManagingSolicitudes> as unknown as ForManagingSolicitudes,

    notifier: { notificar: vi.fn() } satisfies Partial<ForNotifying> as unknown as ForNotifying,

    historial: { registrar: vi.fn() } satisfies Partial<ForManagingHistorial> as unknown as ForManagingHistorial,

    stock: {
      liberarReserva: vi.fn(),
      verificarYReservar: vi.fn(),
    } satisfies Partial<ForManagingStock> as unknown as ForManagingStock,
  };
}

function permisoError(): RegExp {
  return /(No tenés permiso|No autorizado)/;
}

// =============================================================================
// Suite principal
// =============================================================================

describe("Solicitud — Máquina de Estados (canonical)", () => {

  // ===========================================================================
  // 1. Transiciones válidas — entidad pura
  // ===========================================================================

  describe("Transiciones válidas", () => {

    it.each([
      [EstadoSolicitud.Asignada, EstadoSolicitud.EnPreparacion],
      [EstadoSolicitud.EnPreparacion, EstadoSolicitud.Lista],
      [EstadoSolicitud.Lista, EstadoSolicitud.EnCamino],
      [EstadoSolicitud.EnCamino, EstadoSolicitud.Lanzada],
    ])("%s → %s via avanzarEstado()", (desde, hasta) => {
      const s = solicitudEn(desde);
      s.avanzarEstado(hasta);
      expect(s.estado).toBe(hasta);
      expect(s.fechaActualizacion).toBeInstanceOf(Date);
    });

    it("Creada → Asignada via asignar()", () => {
      const s = solicitudEn(EstadoSolicitud.Creada);
      s.asignar("base-001");
      expect(s.estado).toBe(EstadoSolicitud.Asignada);
      expect(s.id_base).toBe("base-001");
    });

    it("Creada → Rechazada via rechazar()", () => {
      const s = solicitudEn(EstadoSolicitud.Creada);
      s.rechazar();
      expect(s.estado).toBe(EstadoSolicitud.Rechazada);
    });

    it.each([EstadoSolicitud.Creada, EstadoSolicitud.Asignada])(
      "%s → Cancelada via cancelar()",
      (desde) => {
        const s = solicitudEn(desde);
        s.cancelar("motivo de prueba");
        expect(s.estado).toBe(EstadoSolicitud.Cancelada);
        expect(s.motivoCancelacion).toBe("motivo de prueba");
      },
    );

    it.each([
      EstadoSolicitud.Asignada,
      EstadoSolicitud.EnPreparacion,
      EstadoSolicitud.Lista,
      EstadoSolicitud.EnCamino,
      EstadoSolicitud.Lanzada,
    ])("%s → Anulada via anular()", (desde) => {
      const s = solicitudEn(desde);
      s.anular("motivo de prueba");
      expect(s.estado).toBe(EstadoSolicitud.Anulada);
      expect(s.motivoAnulacion).toBe("motivo de prueba");
    });

    it("Lanzada → Completada via confirmarEntrega()", () => {
      const s = solicitudEn(EstadoSolicitud.Lanzada);
      s.confirmarEntrega();
      expect(s.estado).toBe(EstadoSolicitud.Completada);
      expect(s.fecha_entrega).toBeInstanceOf(Date);
    });
  });

  // ===========================================================================
  // 2. Transiciones inválidas — saltos (forward non-adjacent)
  // ===========================================================================

  describe("Saltos de estado inválidos", () => {
    it.each([
      [EstadoSolicitud.Creada, EstadoSolicitud.EnPreparacion],
      [EstadoSolicitud.Creada, EstadoSolicitud.Lista],
      [EstadoSolicitud.Creada, EstadoSolicitud.Lanzada],
      [EstadoSolicitud.Creada, EstadoSolicitud.Completada],
      [EstadoSolicitud.Asignada, EstadoSolicitud.Lista],
      [EstadoSolicitud.Asignada, EstadoSolicitud.Lanzada],
      [EstadoSolicitud.EnPreparacion, EstadoSolicitud.EnCamino],
      [EstadoSolicitud.EnPreparacion, EstadoSolicitud.Lanzada],
      [EstadoSolicitud.Lista, EstadoSolicitud.Lanzada],
      [EstadoSolicitud.Lista, EstadoSolicitud.Completada],
      [EstadoSolicitud.EnCamino, EstadoSolicitud.Completada],
    ])("%s -/-> %s lanza error", (desde, destino) => {
      const s = solicitudEn(desde);
      expect(() => s.avanzarEstado(destino)).toThrow("Transición inválida");
    });
  });

  // ===========================================================================
  // 3. Transiciones inválidas — retrocesos
  // ===========================================================================

  describe("Retrocesos de estado inválidos", () => {
    it.each([
      [EstadoSolicitud.Asignada, EstadoSolicitud.Creada],
      [EstadoSolicitud.EnPreparacion, EstadoSolicitud.Asignada],
      [EstadoSolicitud.EnPreparacion, EstadoSolicitud.Creada],
      [EstadoSolicitud.Lista, EstadoSolicitud.EnPreparacion],
      [EstadoSolicitud.Lista, EstadoSolicitud.Asignada],
      [EstadoSolicitud.EnCamino, EstadoSolicitud.Lista],
      [EstadoSolicitud.EnCamino, EstadoSolicitud.EnPreparacion],
      [EstadoSolicitud.Lanzada, EstadoSolicitud.EnCamino],
      [EstadoSolicitud.Lanzada, EstadoSolicitud.Lista],
    ])("%s -/-> %s lanza error", (desde, destino) => {
      const s = solicitudEn(desde);
      expect(() => s.avanzarEstado(destino)).toThrow("Transición inválida");
    });
  });

  // ===========================================================================
  // 4. Transiciones inválidas — destinos exclusivos de otros estados
  // ===========================================================================

  describe("Destinos exclusivos no accesibles", () => {
    it("Asignada no puede ir a Rechazada (solo desde Creada)", () => {
      const s = solicitudEn(EstadoSolicitud.Asignada);
      expect(() => s.avanzarEstado(EstadoSolicitud.Rechazada)).toThrow("Transición inválida");
    });

    it("EnPreparacion no puede ir a Cancelada (solo desde Creada/Asignada)", () => {
      const s = solicitudEn(EstadoSolicitud.EnPreparacion);
      expect(() => s.cancelar()).toThrow("No se puede cancelar");
    });

    it("Lista no puede ir a Cancelada", () => {
      const s = solicitudEn(EstadoSolicitud.Lista);
      expect(() => s.cancelar()).toThrow("No se puede cancelar");
    });
  });

  // ===========================================================================
  // 5. Estados terminales — sin transiciones salientes
  // ===========================================================================

  describe("Estados terminales sin transiciones salientes", () => {
    const terminales = [
      EstadoSolicitud.Completada,
      EstadoSolicitud.Cancelada,
      EstadoSolicitud.Rechazada,
      EstadoSolicitud.Anulada,
    ] as const;

    it.each(terminales)("%s no permite avanzarEstado()", (terminal) => {
      const s = solicitudEn(terminal);
      expect(() => s.avanzarEstado(EstadoSolicitud.Creada)).toThrow("Transición inválida");
      expect(() => s.avanzarEstado(EstadoSolicitud.Asignada)).toThrow("Transición inválida");
      expect(() => s.avanzarEstado(EstadoSolicitud.EnPreparacion)).toThrow("Transición inválida");
    });

    it.each(terminales)("%s no permite cancelar()", (terminal) => {
      const s = solicitudEn(terminal);
      expect(() => s.cancelar()).toThrow(/No se puede cancelar/);
    });

    it.each(terminales)("%s no permite anular()", (terminal) => {
      const s = solicitudEn(terminal);
      // Rechazada no está en ESTADOS_NO_ANULABLES, pero transicionarA() la bloquea
      expect(() => s.anular("motivo")).toThrow(/No se puede anular|Transición inválida/);
    });

    it("estaFinalizada() retorna true para todos los terminales", () => {
      for (const estado of terminales) {
        expect(solicitudEn(estado).estaFinalizada()).toBe(true);
      }
    });

    it("estaFinalizada() retorna false para estados no terminales", () => {
      const noTerminales = [
        EstadoSolicitud.Creada,
        EstadoSolicitud.Asignada,
        EstadoSolicitud.EnPreparacion,
        EstadoSolicitud.Lista,
        EstadoSolicitud.EnCamino,
        EstadoSolicitud.Lanzada,
      ];
      for (const estado of noTerminales) {
        expect(solicitudEn(estado).estaFinalizada()).toBe(false);
      }
    });
  });

  // ===========================================================================
  // 6. Reglas automáticas de stock
  // ===========================================================================

  describe("Reglas automáticas de stock", () => {
    it("Stock suficiente → asignar() → Creada → Asignada", () => {
      const s = solicitudEn(EstadoSolicitud.Creada);
      s.asignar("base-001");
      expect(s.estado).toBe(EstadoSolicitud.Asignada);
      expect(s.id_base).toBe("base-001");
    });

    it("Stock insuficiente → rechazar() → Creada → Rechazada", () => {
      const s = solicitudEn(EstadoSolicitud.Creada);
      s.rechazar();
      expect(s.estado).toBe(EstadoSolicitud.Rechazada);
    });
  });

  // ===========================================================================
  // 7. Permisos por rol — tests a nivel de caso de uso
  // ===========================================================================

  describe("Permisos por rol", () => {
    let mocks: ReturnType<typeof createMocks>;
    let cancelarUC: CancelarSolicitud;
    let preparacionUC: RegistrarEnPreparacionUseCase;
    let listoUC: RegistrarListaUseCase;
    let caminoUC: RegistrarEnCaminoUseCase;
    let lanzadaUC: RegistrarLanzadaUseCase;
    let completarUC: ConfirmarRecibidaUseCase;
    let anularUC: AnularSolicitudUseCase;

    beforeEach(() => {
      vi.clearAllMocks();
      mocks = createMocks();
      cancelarUC = new CancelarSolicitud(mocks.repo, mocks.stock);
      preparacionUC = new RegistrarEnPreparacionUseCase(mocks.repo, mocks.notifier, mocks.historial);
      listoUC = new RegistrarListaUseCase(mocks.repo, mocks.notifier, mocks.historial);
      caminoUC = new RegistrarEnCaminoUseCase(mocks.repo, mocks.notifier, mocks.historial);
      lanzadaUC = new RegistrarLanzadaUseCase(mocks.repo, mocks.notifier, mocks.historial);
      completarUC = new ConfirmarRecibidaUseCase(mocks.repo, mocks.notifier, mocks.historial);
      anularUC = new AnularSolicitudUseCase(mocks.repo, mocks.notifier, mocks.historial);
    });

    // ── Creada/Asignada → Cancelada ────────────────────────────────────────

    describe("Creada / Asignada → Cancelada", () => {
      it.each([
        { rol: "solicitante" as const, id_usuario: "usr-001", desc: "Solicitante (dueño)" },
        { rol: "admin" as const, id_usuario: "admin-001", desc: "Admin" },
      ])("$desc autorizado", async ({ rol, id_usuario }) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.Creada));
        await expect(
          cancelarUC.ejecutar({ id_solicitud: "sol-001", id_usuario, rol }),
        ).resolves.toBeDefined();
      });

      it("Solicitante no autorizado sobre solicitud ajena", async () => {
        mocks.repo.buscarPorId.mockResolvedValue(
          solicitudEn(EstadoSolicitud.Creada, { id_usuario: "usr-002" }),
        );
        await expect(
          cancelarUC.ejecutar({ id_solicitud: "sol-001", id_usuario: "usr-001", rol: "solicitante" }),
        ).rejects.toThrow(permisoError());
      });

      it("Remitente no autorizado (no está en la tabla canónica)", async () => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.Creada));
        await expect(
          cancelarUC.ejecutar({ id_solicitud: "sol-001", id_usuario: "rem-001", rol: "solicitante" }),
        ).rejects.toThrow(permisoError());
      });
    });

    // ── Asignada → En Preparación ──────────────────────────────────────────

    describe("Asignada → En Preparación", () => {
      it.each([
        { rol: "remitente" as const, actorId: "rem-001", desc: "Remitente asignado" },
        { rol: "admin" as const, actorId: "admin-001", desc: "Admin" },
      ])("$desc autorizado", async ({ rol, actorId }) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.Asignada));
        await expect(
          preparacionUC.ejecutar({ solicitudId: "sol-001", actorId, rol }),
        ).resolves.toBeUndefined();
      });

      it("Remitente no asignado no autorizado", async () => {
        mocks.repo.buscarPorId.mockResolvedValue(
          solicitudEn(EstadoSolicitud.Asignada, { id_base: "rem-002" }),
        );
        await expect(
          preparacionUC.ejecutar({ solicitudId: "sol-001", actorId: "rem-001", rol: "remitente" }),
        ).rejects.toThrow(permisoError());
      });
    });

    // ── En Preparación → Lista ─────────────────────────────────────────────

    describe("En Preparación → Lista", () => {
      it.each([
        { rol: "remitente" as const, actorId: "rem-001", desc: "Remitente asignado" },
        { rol: "admin" as const, actorId: "admin-001", desc: "Admin" },
      ])("$desc autorizado", async ({ rol, actorId }) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.EnPreparacion));
        await expect(
          listoUC.ejecutar({ solicitudId: "sol-001", actorId, rol }),
        ).resolves.toBeUndefined();
      });
    });

    // ── Lista → En Camino ──────────────────────────────────────────────────

    describe("Lista → En Camino", () => {
      it.each([
        { rol: "remitente" as const, actorId: "rem-001", desc: "Remitente asignado" },
        { rol: "admin" as const, actorId: "admin-001", desc: "Admin" },
      ])("$desc autorizado", async ({ rol, actorId }) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.Lista));
        await expect(
          caminoUC.ejecutar({ solicitudId: "sol-001", actorId, rol }),
        ).resolves.toBeUndefined();
      });
    });

    // ── En Camino → Lanzada ────────────────────────────────────────────────

    describe("En Camino → Lanzada", () => {
      it.each([
        { rol: "remitente" as const, actorId: "rem-001", desc: "Remitente asignado" },
        { rol: "admin" as const, actorId: "admin-001", desc: "Admin" },
      ])("$desc autorizado", async ({ rol, actorId }) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.EnCamino));
        await expect(
          lanzadaUC.ejecutar({ solicitudId: "sol-001", actorId, rol }),
        ).resolves.toBeUndefined();
      });
    });

    // ── Lanzada → Completada ───────────────────────────────────────────────

    describe("Lanzada → Completada", () => {
      it.each([
        { rol: "solicitante" as const, actorId: "usr-001", desc: "Solicitante (dueño)" },
        { rol: "admin" as const, actorId: "admin-001", desc: "Admin" },
      ])("$desc autorizado", async ({ rol, actorId }) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(EstadoSolicitud.Lanzada));
        await expect(
          completarUC.ejecutar({ solicitudId: "sol-001", actorId, rol }),
        ).resolves.toBeUndefined();
      });

      it("Solicitante ajeno no autorizado", async () => {
        mocks.repo.buscarPorId.mockResolvedValue(
          solicitudEn(EstadoSolicitud.Lanzada, { id_usuario: "usr-002" }),
        );
        await expect(
          completarUC.ejecutar({ solicitudId: "sol-001", actorId: "usr-001", rol: "solicitante" }),
        ).rejects.toThrow(permisoError());
      });
    });

    // ── Anular (varios → Anulada) ──────────────────────────────────────────

    describe("Varios → Anulada", () => {
      it.each([
        EstadoSolicitud.Asignada,
        EstadoSolicitud.EnPreparacion,
        EstadoSolicitud.Lista,
        EstadoSolicitud.EnCamino,
        EstadoSolicitud.Lanzada,
      ])("anula desde %s exitosamente", async (desde) => {
        mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(desde));
        await expect(anularUC.ejecutar("sol-001", "motivo", "admin-001")).resolves.toBeUndefined();
        const guardada = mocks.repo.actualizar.mock.calls[0][0] as Solicitud;
        expect(guardada.estado).toBe(EstadoSolicitud.Anulada);
      });

      it("No permite anular desde estados terminales", async () => {
        for (const terminal of [EstadoSolicitud.Completada, EstadoSolicitud.Cancelada, EstadoSolicitud.Anulada]) {
          mocks.repo.buscarPorId.mockResolvedValue(solicitudEn(terminal));
          await expect(anularUC.ejecutar("sol-001", "motivo", "admin-001")).rejects.toThrow();
        }
      });

      it.todo("Remitente autorizado para anular (validado en action layer)");
      it.todo("Admin autorizado para anular (validado en action layer)");
      it.todo("Solicitante NO autorizado para anular (validado en action layer)");
    });
  });

  // ===========================================================================
  // 8. Gaps canónicos — comportamiento especificado pero no implementado
  // ===========================================================================

  describe("Gaps canónicos — estado Aprobada", () => {
    it.todo("Creada → Aprobada (sistema, stock suficiente) — estado Aprobada no existe en el enum actual");
    it.todo("Aprobada → Asignada — requiere estado intermedio Aprobada");
    it.todo("Aprobada → Cancelada (Solicitante/Admin) — requiere estado intermedio Aprobada");
  });
});
