import { describe, it, expect } from "vitest";
import { Trayectoria } from "@/src/modules/trayectoria/domain/entities/Trayectoria";
import type { PuntoGeometria } from "@/src/types/geometria";

const puntoBase: PuntoGeometria = {
  type: "Point",
  coordinates: [-62.3, -38.7],
};

const condicionesClimaticasBase = {
  velocidad_viento_ms: 10,
  direccion_viento_grados: 90,
  presion_atmosferica_hPa: 1013,
  altitud_terreno_m: 100,
  temperatura_c: 20,
};

const propsBase = {
  id_trayectoria: "tray-001",
  id_envio: "env-001",
  punto_lanzamiento: puntoBase,
  offset_norte_m: 150,
  offset_este_m: 200,
  timestamp_estimado: new Date("2026-06-21T10:00:00Z"),
  condiciones_seguras: true,
  condiciones_climaticas: condicionesClimaticasBase,
  altitud_liberacion_m: 1000,
  peso_total_kg: 50,
};

describe("Trayectoria", () => {
  describe("crear", () => {
    it("genera created_at como Date", () => {
      const trayectoria = Trayectoria.crear(propsBase);
      expect(trayectoria.created_at).toBeInstanceOf(Date);
    });

    it("genera id_trayectoria a partir del valor pasado", () => {
      const trayectoria = Trayectoria.crear(propsBase);
      expect(trayectoria.id_trayectoria).toBe("tray-001");
    });

    it("asigna correctamente todos los campos", () => {
      const trayectoria = Trayectoria.crear(propsBase);
      expect(trayectoria.id_envio).toBe("env-001");
      expect(trayectoria.punto_lanzamiento).toBe(puntoBase);
      expect(trayectoria.offset_norte_m).toBe(150);
      expect(trayectoria.offset_este_m).toBe(200);
      expect(trayectoria.timestamp_estimado).toEqual(new Date("2026-06-21T10:00:00Z"));
      expect(trayectoria.condiciones_seguras).toBe(true);
      expect(trayectoria.condiciones_climaticas).toEqual(condicionesClimaticasBase);
      expect(trayectoria.altitud_liberacion_m).toBe(1000);
      expect(trayectoria.peso_total_kg).toBe(50);
    });
  });

  describe("reconstruir", () => {
    it("preserva exactamente los valores pasados", () => {
      const trayectoria = Trayectoria.reconstruir({
        ...propsBase,
        created_at: new Date("2026-01-01T00:00:00Z"),
      });

      expect(trayectoria.id_trayectoria).toBe("tray-001");
      expect(trayectoria.id_envio).toBe("env-001");
      expect(trayectoria.offset_norte_m).toBe(150);
      expect(trayectoria.condiciones_seguras).toBe(true);
      expect(trayectoria.created_at).toEqual(new Date("2026-01-01T00:00:00Z"));
    });

    it("reconstruye con condiciones inseguras", () => {
      const trayectoria = Trayectoria.reconstruir({
        ...propsBase,
        condiciones_seguras: false,
        created_at: new Date(),
      });

      expect(trayectoria.condiciones_seguras).toBe(false);
    });
  });

  describe("getters", () => {
    it("expone la propiedad id_trayectoria", () => {
      const t = Trayectoria.crear(propsBase);
      expect(t.id_trayectoria).toBe("tray-001");
    });

    it("expone la propiedad id_envio", () => {
      const t = Trayectoria.crear(propsBase);
      expect(t.id_envio).toBe("env-001");
    });

    it("expone la propiedad punto_lanzamiento", () => {
      const t = Trayectoria.crear(propsBase);
      expect(t.punto_lanzamiento.coordinates).toEqual([-62.3, -38.7]);
    });

    it("expone la propiedad condiciones_climaticas", () => {
      const t = Trayectoria.crear(propsBase);
      expect(t.condiciones_climaticas.velocidad_viento_ms).toBe(10);
    });

    it("expone la propiedad created_at", () => {
      const t = Trayectoria.crear(propsBase);
      expect(t.created_at).toBeInstanceOf(Date);
    });
  });
});
