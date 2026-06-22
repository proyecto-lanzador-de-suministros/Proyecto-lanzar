import { describe, it, expect, vi, beforeEach } from "vitest";
import { CachedWeatherAdapter } from "@/src/modules/trayectoria/infrastructure/adapters/cachedWeatherAdapter";
import type { ForCachingWeather } from "@/src/modules/trayectoria/domain/ports/forCachingWeather.port";
import type { ForGettingWeather } from "@/src/modules/trayectoria/domain/ports/forGettingWeather.port";
import type { CondicionesClimaticas } from "@/src/modules/trayectoria/domain/entities/Trayectoria";

const condicionesMock: CondicionesClimaticas = {
  velocidad_viento_ms: 10,
  direccion_viento_grados: 180,
  presion_atmosferica_hPa: 1013,
  altitud_terreno_m: 100,
  temperatura_c: 20,
};

describe("CachedWeatherAdapter", () => {
  let apiMock: { obtenerPorCoordenadas: ReturnType<typeof vi.fn> };
  let cacheMock: {
    obtener: ReturnType<typeof vi.fn>;
    guardar: ReturnType<typeof vi.fn>;
  };
  let adapter: CachedWeatherAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    apiMock = { obtenerPorCoordenadas: vi.fn() };
    cacheMock = { obtener: vi.fn(), guardar: vi.fn() };
    adapter = new CachedWeatherAdapter(
      apiMock as unknown as ForGettingWeather,
      cacheMock as unknown as ForCachingWeather,
    );
  });

  it("retorna datos cacheados cuando el cache tiene la clave", async () => {
    cacheMock.obtener.mockResolvedValue(condicionesMock);

    const result = await adapter.obtenerPorCoordenadas(-38.7, -62.3);

    expect(result).toEqual(condicionesMock);
    expect(apiMock.obtenerPorCoordenadas).not.toHaveBeenCalled();
    expect(cacheMock.guardar).not.toHaveBeenCalled();
  });

  it("consulta la API y guarda en cache cuando hay cache miss", async () => {
    cacheMock.obtener.mockResolvedValue(null);
    apiMock.obtenerPorCoordenadas.mockResolvedValue(condicionesMock);

    const result = await adapter.obtenerPorCoordenadas(-38.7, -62.3);

    expect(result).toEqual(condicionesMock);
    expect(apiMock.obtenerPorCoordenadas).toHaveBeenCalledWith(-38.7, -62.3);
    expect(cacheMock.guardar).toHaveBeenCalledWith(-38.7, -62.3, condicionesMock, 420);
  });

  it("funciona cuando el cache no está disponible (retorna null sin error)", async () => {
    cacheMock.obtener.mockRejectedValue(new Error("Redis down"));
    apiMock.obtenerPorCoordenadas.mockResolvedValue(condicionesMock);

    const result = await adapter.obtenerPorCoordenadas(-38.7, -62.3);

    expect(result).toEqual(condicionesMock);
    expect(apiMock.obtenerPorCoordenadas).toHaveBeenCalled();
  });

  it("propaga errores de la API externa", async () => {
    cacheMock.obtener.mockResolvedValue(null);
    apiMock.obtenerPorCoordenadas.mockRejectedValue(new Error("API error"));

    await expect(
      adapter.obtenerPorCoordenadas(-38.7, -62.3),
    ).rejects.toThrow("API error");
  });
});
