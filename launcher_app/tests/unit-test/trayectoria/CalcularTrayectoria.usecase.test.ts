import { describe, it, expect, vi, beforeEach } from "vitest";
import { CalcularTrayectoria } from "@/src/modules/trayectoria/domain/use-cases/CalcularTrayectoria.usecase";
import type { ForGettingWeather } from "@/src/modules/trayectoria/domain/ports/forGettingWeather.port";
import type { ForCalculatingTrajectory, ResultadoTrayectoria } from "@/src/modules/trayectoria/domain/ports/forCalculatingTrajectory.port";
import type { CondicionesClimaticas } from "@/src/modules/trayectoria/domain/entities/Trayectoria";
import type { PuntoGeometria } from "@/src/types/geometria";

const destino: PuntoGeometria = {
  type: "Point",
  coordinates: [-62.3, -38.7],
};

const condicionesClimaticas: CondicionesClimaticas = {
  velocidad_viento_ms: 10,
  direccion_viento_grados: 90,
  presion_atmosferica_hPa: 1013,
  altitud_terreno_m: 100,
  temperatura_c: 20,
};

const resultadoCalculo: ResultadoTrayectoria = {
  punto_lanzamiento: {
    type: "Point",
    coordinates: [-62.28, -38.69],
  },
  offset_norte_m: 150,
  offset_este_m: 200,
  timestamp_estimado: new Date("2026-06-21T10:00:00Z"),
  condiciones_seguras: true,
};

describe("CalcularTrayectoria", () => {
  let weatherMock: { obtenerPorCoordenadas: ReturnType<typeof vi.fn> };
  let calculatorMock: { calcular: ReturnType<typeof vi.fn> };
  let useCase: CalcularTrayectoria;

  beforeEach(() => {
    vi.clearAllMocks();
    weatherMock = { obtenerPorCoordenadas: vi.fn() };
    calculatorMock = { calcular: vi.fn() };
    useCase = new CalcularTrayectoria(
      weatherMock as unknown as ForGettingWeather,
      calculatorMock as unknown as ForCalculatingTrajectory,
    );
  });

  it("orquesta weather → calculator y devuelve una Trayectoria", async () => {
    weatherMock.obtenerPorCoordenadas.mockResolvedValue(condicionesClimaticas);
    calculatorMock.calcular.mockResolvedValue(resultadoCalculo);

    const result = await useCase.ejecutar({
      id_envio: "env-001",
      destino,
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      condiciones_climaticas: condicionesClimaticas,
    });

    expect(result).toBeDefined();
    expect(result.id_envio).toBe("env-001");
    expect(result.peso_total_kg).toBe(50);
    expect(result.altitud_liberacion_m).toBe(1000);
  });

  it("llama al weatherService con la latitud y longitud extraídas del destino", async () => {
    weatherMock.obtenerPorCoordenadas.mockResolvedValue(condicionesClimaticas);
    calculatorMock.calcular.mockResolvedValue(resultadoCalculo);

    await useCase.ejecutar({
      id_envio: "env-001",
      destino,
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      condiciones_climaticas: condicionesClimaticas,
    });

    expect(weatherMock.obtenerPorCoordenadas).toHaveBeenCalledWith(-38.7, -62.3);
  });

  it("pasa los parámetros correctos al trajectoryCalculator", async () => {
    weatherMock.obtenerPorCoordenadas.mockResolvedValue(condicionesClimaticas);
    calculatorMock.calcular.mockResolvedValue(resultadoCalculo);

    await useCase.ejecutar({
      id_envio: "env-001",
      destino,
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      condiciones_climaticas: condicionesClimaticas,
    });

    expect(calculatorMock.calcular).toHaveBeenCalledWith({
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      destino,
      condiciones_climaticas: condicionesClimaticas,
    });
  });

  it("usa las condiciones climáticas reales devueltas por el weather service", async () => {
    weatherMock.obtenerPorCoordenadas.mockResolvedValue(condicionesClimaticas);
    calculatorMock.calcular.mockResolvedValue(resultadoCalculo);

    const result = await useCase.ejecutar({
      id_envio: "env-001",
      destino,
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      condiciones_climaticas: condicionesClimaticas,
    });

    expect(result.condiciones_climaticas).toEqual(condicionesClimaticas);
  });

  it("propaga id_envio, peso_total_kg, altitud_liberacion_m a la entidad resultante", async () => {
    weatherMock.obtenerPorCoordenadas.mockResolvedValue(condicionesClimaticas);
    calculatorMock.calcular.mockResolvedValue(resultadoCalculo);

    const result = await useCase.ejecutar({
      id_envio: "env-001",
      destino,
      peso_total_kg: 50,
      altitud_liberacion_m: 1000,
      condiciones_climaticas: condicionesClimaticas,
    });

    expect(result.id_envio).toBe("env-001");
    expect(result.peso_total_kg).toBe(50);
    expect(result.altitud_liberacion_m).toBe(1000);
  });

  it("rechaza si el weatherService lanza error", async () => {
    weatherMock.obtenerPorCoordenadas.mockRejectedValue(new Error("Weather API error"));

    await expect(
      useCase.ejecutar({
        id_envio: "env-001",
        destino,
        peso_total_kg: 50,
        altitud_liberacion_m: 1000,
        condiciones_climaticas: condicionesClimaticas,
      }),
    ).rejects.toThrow("Weather API error");
  });

  it("rechaza si el trajectoryCalculator lanza error", async () => {
    weatherMock.obtenerPorCoordenadas.mockResolvedValue(condicionesClimaticas);
    calculatorMock.calcular.mockRejectedValue(new Error("Calculation error"));

    await expect(
      useCase.ejecutar({
        id_envio: "env-001",
        destino,
        peso_total_kg: 50,
        altitud_liberacion_m: 1000,
        condiciones_climaticas: condicionesClimaticas,
      }),
    ).rejects.toThrow("Calculation error");
  });
});
