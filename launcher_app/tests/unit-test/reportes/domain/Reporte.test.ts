import { describe, it, expect } from "vitest";
import { Reporte } from "@/src/modules/reportes/domain/entities/Reporte";

describe("Reporte", () => {
  describe("crearSolicitudes", () => {
    it("crea reporte de solicitudes con datos correctos", () => {
      const datos = {
        filas: [],
        resumen: { total: 0, porEstado: {}, porPrioridad: {} },
      };

      const reporte = Reporte.crearSolicitudes(datos, "usr-001");

      expect(reporte.tipo).toBe("solicitudes");
      expect(reporte.generadoPor).toBe("usr-001");
      expect(reporte.datos).toBe(datos);
      expect(reporte.fechaGeneracion).toBeInstanceOf(Date);
    });
  });

  describe("crearStock", () => {
    it("crea reporte de stock con datos correctos", () => {
      const datos = [
        { id: "stk-001", base: "Base Central", producto: "Vacunas", cantidadDisponible: 100 },
      ];

      const reporte = Reporte.crearStock(datos, "usr-002");

      expect(reporte.tipo).toBe("stock");
      expect(reporte.generadoPor).toBe("usr-002");
      expect(reporte.datos).toBe(datos);
    });
  });
});
