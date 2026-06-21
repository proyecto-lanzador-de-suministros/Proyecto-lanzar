import { describe, it, expect } from "vitest";
import { RegistroHistorial } from "@/src/modules/historial/domain/entities/RegistroHistorial";

describe("RegistroHistorial", () => {
  describe("registrar", () => {
    it("registra cambio de estado válido", () => {
      const registro = RegistroHistorial.registrar({
        solicitudId: "sol-001",
        estadoAnterior: "Creada",
        estadoNuevo: "Aprobada",
        actorId: "usr-001",
      });

      expect(registro.id).toBeDefined();
      expect(registro.solicitudId).toBe("sol-001");
      expect(registro.estadoAnterior).toBe("Creada");
      expect(registro.estadoNuevo).toBe("Aprobada");
      expect(registro.actorId).toBe("usr-001");
      expect(registro.motivo).toBeNull();
      expect(registro.fechaHora).toBeInstanceOf(Date);
    });

    it("registra primer evento sin estado anterior", () => {
      const registro = RegistroHistorial.registrar({
        solicitudId: "sol-002",
        estadoNuevo: "Creada",
        actorId: "usr-001",
      });

      expect(registro.estadoAnterior).toBeNull();
    });

    it("registra con motivo opcional", () => {
      const registro = RegistroHistorial.registrar({
        solicitudId: "sol-001",
        estadoAnterior: "Aprobada",
        estadoNuevo: "Cancelada",
        actorId: "usr-001",
        motivo: "Falta de stock",
      });

      expect(registro.motivo).toBe("Falta de stock");
    });

    it("lanza error si estados son iguales", () => {
      expect(() =>
        RegistroHistorial.registrar({
          solicitudId: "sol-001",
          estadoAnterior: "Aprobada",
          estadoNuevo: "Aprobada",
          actorId: "usr-001",
        })
      ).toThrow("El estado nuevo debe ser diferente al anterior");
    });
  });
});
