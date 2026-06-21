import { describe, it, expect } from "vitest";
import { TrajectoryCalculatorAdapter } from "@/src/modules/trayectoria/infrastructure/adapters/TrajectoryCalculatorAdapter";
import type { PuntoGeometria } from "@/src/types/geometria";

const GRAVEDAD = 9.81;

describe("TrajectoryCalculatorAdapter", () => {
  const adapter = new TrajectoryCalculatorAdapter();

  const destino: PuntoGeometria = {
    type: "Point",
    coordinates: [-62.3, -38.7],
  };

  it("calcula tiempoCaida = sqrt(2 * altitud / g)", async () => {
    const result = await adapter.calcular({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino,
      condiciones_climaticas: {
        velocidad_viento_ms: 0,
        direccion_viento_grados: 0,
        presion_atmosferica_hPa: 1013,
        altitud_terreno_m: 100,
        temperatura_c: 20,
      },
    });

    const expectedTiempo = Math.sqrt((2 * 1000) / GRAVEDAD);
    // timestamp_estimado debe ser futuro: ahora + tiempoCaida en ms
    const diffMs = result.timestamp_estimado.getTime() - Date.now();
    const expectedDiffMs = Math.round(expectedTiempo * 1000);
    expect(Math.abs(diffMs - expectedDiffMs)).toBeLessThan(100);
  });

  it("retorna offset 0 cuando no hay viento", async () => {
    const result = await adapter.calcular({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino,
      condiciones_climaticas: {
        velocidad_viento_ms: 0,
        direccion_viento_grados: 90,
        presion_atmosferica_hPa: 1013,
        altitud_terreno_m: 100,
        temperatura_c: 20,
      },
    });

    expect(result.offset_norte_m).toBeCloseTo(0, 1);
    expect(result.offset_este_m).toBeCloseTo(0, 1);
  });

  it("calcula offset con viento a 90° (este)", async () => {
    const velocidad = 10;
    const result = await adapter.calcular({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino,
      condiciones_climaticas: {
        velocidad_viento_ms: velocidad,
        direccion_viento_grados: 90,
        presion_atmosferica_hPa: 1013,
        altitud_terreno_m: 100,
        temperatura_c: 20,
      },
    });

    const tiempoCaida = Math.sqrt((2 * 1000) / GRAVEDAD);
    const drift = velocidad * tiempoCaida;
    const dirRad = (90 * Math.PI) / 180;
    const expectedNorte = drift * Math.cos(dirRad);
    const expectedEste = drift * Math.sin(dirRad);

    expect(result.offset_norte_m).toBeCloseTo(expectedNorte, 1);
    expect(result.offset_este_m).toBeCloseTo(expectedEste, 1);
  });

  it("retorna condiciones_seguras true cuando viento < 15 m/s", async () => {
    const result = await adapter.calcular({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino,
      condiciones_climaticas: {
        velocidad_viento_ms: 14,
        direccion_viento_grados: 180,
        presion_atmosferica_hPa: 1013,
        altitud_terreno_m: 100,
        temperatura_c: 20,
      },
    });

    expect(result.condiciones_seguras).toBe(true);
  });

  it("retorna condiciones_seguras false cuando viento >= 15 m/s", async () => {
    const result = await adapter.calcular({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino,
      condiciones_climaticas: {
        velocidad_viento_ms: 15,
        direccion_viento_grados: 180,
        presion_atmosferica_hPa: 1013,
        altitud_terreno_m: 100,
        temperatura_c: 20,
      },
    });

    expect(result.condiciones_seguras).toBe(false);
  });

  it("retorna punto_lanzamiento desplazado desde el destino", async () => {
    const result = await adapter.calcular({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino: {
        type: "Point",
        coordinates: [-62.3, -38.7],
      },
      condiciones_climaticas: {
        velocidad_viento_ms: 10,
        direccion_viento_grados: 90,
        presion_atmosferica_hPa: 1013,
        altitud_terreno_m: 100,
        temperatura_c: 20,
      },
    });

    expect(result.punto_lanzamiento.type).toBe("Point");
    expect(result.punto_lanzamiento.coordinates).toHaveLength(2);
    // Lon debe ser diferente de la original porque hay offset este
    expect(result.punto_lanzamiento.coordinates[0]).not.toBe(-62.3);
  });

  it("ajusta correctamente la longitud en latitudes diferentes (cos lat)", async () => {
    const ecuador: PuntoGeometria = {
      type: "Point",
      coordinates: [-62.3, 0],
    };

    const latitudAlta: PuntoGeometria = {
      type: "Point",
      coordinates: [-62.3, -60],
    };

    const [resultEcuador, resultLatitudAlta] = await Promise.all([
      adapter.calcular({
        peso_total_kg: 50,
        altitud_liberacion_m: 1000,
        destino: ecuador,
        condiciones_climaticas: {
          velocidad_viento_ms: 10,
          direccion_viento_grados: 90,
          presion_atmosferica_hPa: 1013,
          altitud_terreno_m: 100,
          temperatura_c: 20,
        },
      }),
      adapter.calcular({
        peso_total_kg: 50,
        altitud_liberacion_m: 1000,
        destino: latitudAlta,
        condiciones_climaticas: {
          velocidad_viento_ms: 10,
          direccion_viento_grados: 90,
          presion_atmosferica_hPa: 1013,
          altitud_terreno_m: 100,
          temperatura_c: 20,
        },
      }),
    ]);

    const diffLonEcuador = Math.abs(resultEcuador.punto_lanzamiento.coordinates[0] - (-62.3));
    const diffLonLatitudAlta = Math.abs(resultLatitudAlta.punto_lanzamiento.coordinates[0] - (-62.3));

    // En latitudes altas el desplazamiento en longitud debe ser mayor
    expect(diffLonLatitudAlta).toBeGreaterThan(diffLonEcuador);
  });
});
