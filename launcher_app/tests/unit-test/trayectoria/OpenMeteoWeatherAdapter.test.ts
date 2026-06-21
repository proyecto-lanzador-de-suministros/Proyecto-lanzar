import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenMeteoWeatherAdapter } from "@/src/modules/trayectoria/infrastructure/adapters/openMeteoWeatherAdapter";

describe("OpenMeteoWeatherAdapter", () => {
  let adapter: OpenMeteoWeatherAdapter;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    adapter = new OpenMeteoWeatherAdapter();
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("mapea correctamente la respuesta JSON a CondicionesClimaticas", async () => {
    const mockResponse = {
      elevation: 100,
      current: {
        wind_speed_10m: 12.5,
        wind_direction_10m: 180,
        surface_pressure: 1015.2,
        temperature_2m: 22.3,
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await adapter.obtenerPorCoordenadas(-38.7, -62.3);

    expect(result.velocidad_viento_ms).toBe(12.5);
    expect(result.direccion_viento_grados).toBe(180);
    expect(result.presion_atmosferica_hPa).toBe(1015.2);
    expect(result.altitud_terreno_m).toBe(100);
    expect(result.temperatura_c).toBe(22.3);
  });

  it("construye la URL correcta con los parámetros esperados", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        elevation: 0,
        current: {
          wind_speed_10m: 0,
          wind_direction_10m: 0,
          surface_pressure: 1013,
          temperature_2m: 15,
        },
      }),
    });

    globalThis.fetch = fetchMock;

    await adapter.obtenerPorCoordenadas(-38.7, -62.3);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("api.open-meteo.com/v1/forecast");
    expect(url).toContain("latitude=-38.7");
    expect(url).toContain("longitude=-62.3");
    expect(url).toContain("current=");
    expect(url).toContain("wind_speed_unit=ms");
  });

  it("lanza error cuando la respuesta HTTP no es ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(
      adapter.obtenerPorCoordenadas(-38.7, -62.3),
    ).rejects.toThrow("Open-Meteo respondió con error 500");
  });

  it("lanza error cuando el fetch falla por red", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(
      adapter.obtenerPorCoordenadas(-38.7, -62.3),
    ).rejects.toThrow("Network error");
  });

  it("incluye wind_speed_10m, wind_direction_10m, surface_pressure y temperature_2m en current", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        elevation: 50,
        current: {
          wind_speed_10m: 8,
          wind_direction_10m: 270,
          surface_pressure: 1008,
          temperature_2m: 18,
        },
      }),
    });

    globalThis.fetch = fetchMock;

    await adapter.obtenerPorCoordenadas(-34.6, -58.4);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("wind_speed_10m");
    expect(url).toContain("wind_direction_10m");
    expect(url).toContain("surface_pressure");
    expect(url).toContain("temperature_2m");
  });
});
