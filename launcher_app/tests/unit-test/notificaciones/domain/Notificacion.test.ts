import { describe, it, expect } from "vitest";
import { Notificacion } from "@/src/modules/notificaciones/domain/entities/Notificacion";

describe("Notificacion", () => {
  describe("crear", () => {
    it("crea notificación con campos obligatorios", () => {
      const notif = Notificacion.crear({
        mensaje: "Solicitud aprobada",
        destinatarioId: "usr-001",
        tipo: "solicitud",
      });

      expect(notif.id).toBeDefined();
      expect(notif.mensaje).toBe("Solicitud aprobada");
      expect(notif.destinatarioId).toBe("usr-001");
      expect(notif.tipo).toBe("solicitud");
      expect(notif.solicitudId).toBeNull();
      expect(notif.leida).toBe(false);
      expect(notif.fechaHora).toBeInstanceOf(Date);
    });

    it("crea notificación con solicitudId opcional", () => {
      const notif = Notificacion.crear({
        mensaje: "Estado cambiado",
        destinatarioId: "usr-002",
        solicitudId: "sol-001",
        tipo: "solicitud",
      });

      expect(notif.solicitudId).toBe("sol-001");
    });

    it("lanza error si mensaje está vacío", () => {
      expect(() =>
        Notificacion.crear({
          mensaje: "",
          destinatarioId: "usr-001",
          tipo: "solicitud",
        })
      ).toThrow("Mensaje requerido");
    });

    it("lanza error si destinatarioId está vacío", () => {
      expect(() =>
        Notificacion.crear({
          mensaje: "Test",
          destinatarioId: "",
          tipo: "solicitud",
        })
      ).toThrow("Destinatario requerido");
    });
  });

  describe("reconstruir", () => {
    it("reconstruye notificación desde datos existentes", () => {
      const fecha = new Date("2026-01-15");
      const notif = Notificacion.reconstruir({
        id: "notif-001",
        mensaje: "Test",
        fechaHora: fecha,
        destinatarioId: "usr-001",
        solicitudId: "sol-001",
        tipo: "cuenta",
        leida: true,
      });

      expect(notif.id).toBe("notif-001");
      expect(notif.fechaHora).toBe(fecha);
      expect(notif.leida).toBe(true);
    });
  });

  describe("marcarComoLeida", () => {
    it("marca como leída", () => {
      const notif = Notificacion.crear({
        mensaje: "Test",
        destinatarioId: "usr-001",
        tipo: "solicitud",
      });

      expect(notif.leida).toBe(false);
      notif.marcarComoLeida();
      expect(notif.leida).toBe(true);
    });
  });
});
