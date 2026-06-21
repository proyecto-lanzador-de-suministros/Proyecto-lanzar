import { describe, it, expect } from "vitest";
import { Paquete } from "@/src/modules/solicitudes/domain/entities/Paquete";

describe("Paquete", () => {
  describe("crear", () => {
    it("crea paquete con campos por defecto", () => {
      const paquete = Paquete.crear({ solicitudId: "sol-001" });

      expect(paquete.id).toBeDefined();
      expect(paquete.solicitudId).toBe("sol-001");
      expect(paquete.tipoParacaidas).toBeNull();
      expect(paquete.pesoMaximo).toBeNull();
      expect(paquete.estadoMecanico).toBe("nuevo");
    });

    it("crea paquete con campos personalizados", () => {
      const paquete = Paquete.crear({
        solicitudId: "sol-002",
        tipoParacaidas: "Doble",
        pesoMaximo: 50.5,
        estadoMecanico: "bueno",
      });

      expect(paquete.tipoParacaidas).toBe("Doble");
      expect(paquete.pesoMaximo).toBe(50.5);
      expect(paquete.estadoMecanico).toBe("bueno");
    });
  });

  describe("estaOperativo", () => {
    it("retorna true si estado no es averiado", () => {
      const paquete = Paquete.crear({
        solicitudId: "sol-001",
        estadoMecanico: "nuevo",
      });
      expect(paquete.estaOperativo).toBe(true);
    });

    it("retorna false si estado es averiado", () => {
      const paquete = Paquete.crear({
        solicitudId: "sol-001",
        estadoMecanico: "averiado",
      });
      expect(paquete.estaOperativo).toBe(false);
    });
  });
});
