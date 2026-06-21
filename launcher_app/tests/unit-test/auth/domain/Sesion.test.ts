import { describe, it, expect } from "vitest";
import { Sesion } from "@/src/modules/auth/domain/entities/Sesion";

describe("Sesion", () => {
  describe("noAutenticada", () => {
    it("crea sesión no autenticada por defecto", () => {
      const sesion = Sesion.noAutenticada();

      expect(sesion.usuarioId).toBe("");
      expect(sesion.email).toBe("");
      expect(sesion.rol).toBe("solicitante");
      expect(sesion.autenticado).toBe(false);
    });
  });

  describe("dashboardRoute", () => {
    it("retorna ruta correcta para admin", () => {
      const sesion = new Sesion("usr-001", "admin@test.com", "admin", true);
      expect(sesion.dashboardRoute).toBe("/admin");
    });

    it("retorna ruta correcta para remitente", () => {
      const sesion = new Sesion("usr-002", "rem@test.com", "remitente", true);
      expect(sesion.dashboardRoute).toBe("/remitente");
    });

    it("retorna ruta correcta para solicitante", () => {
      const sesion = new Sesion("usr-003", "sol@test.com", "solicitante", true);
      expect(sesion.dashboardRoute).toBe("/solicitante");
    });
  });

  describe("esValida", () => {
    it("retorna true si está autenticada con usuarioId", () => {
      const sesion = new Sesion("usr-001", "test@test.com", "admin", true);
      expect(sesion.esValida()).toBe(true);
    });

    it("retorna false si no está autenticada", () => {
      const sesion = new Sesion("usr-001", "test@test.com", "admin", false);
      expect(sesion.esValida()).toBe(false);
    });

    it("retorna false si no tiene usuarioId", () => {
      const sesion = new Sesion("", "test@test.com", "admin", true);
      expect(sesion.esValida()).toBe(false);
    });
  });

  describe("tieneRol", () => {
    it("retorna true si tiene el rol especificado", () => {
      const sesion = new Sesion("usr-001", "test@test.com", "admin", true);
      expect(sesion.tieneRol("admin")).toBe(true);
    });

    it("retorna false si no tiene el rol", () => {
      const sesion = new Sesion("usr-001", "test@test.com", "remitente", true);
      expect(sesion.tieneRol("admin")).toBe(false);
    });

    it("retorna true si tiene uno de varios roles", () => {
      const sesion = new Sesion("usr-001", "test@test.com", "remitente", true);
      expect(sesion.tieneRol("admin", "remitente")).toBe(true);
    });
  });
});
