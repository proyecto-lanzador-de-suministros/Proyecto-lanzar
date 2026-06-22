import type { ForGettingWeather } from "../../domain/ports/forGettingWeather.port";
import type { ForCachingWeather } from "../../domain/ports/forCachingWeather.port";
import type { CondicionesClimaticas } from "../../domain/entities/Trayectoria";

const TTL_CLIMA_SEGUNDOS = 420;

export class CachedWeatherAdapter implements ForGettingWeather {
  constructor(
    private readonly api: ForGettingWeather,
    private readonly cache: ForCachingWeather,
  ) {}

  async obtenerPorCoordenadas(
    lat: number,
    lon: number,
  ): Promise<CondicionesClimaticas> {
    try {
      const cacheadas = await this.cache.obtener(lat, lon);
      if (cacheadas) return cacheadas;
    } catch (err) {
      console.warn("[CachedWeather] Error al leer caché:", (err as Error).message);
    }

    const reales = await this.api.obtenerPorCoordenadas(lat, lon);

    try {
      await this.cache.guardar(lat, lon, reales, TTL_CLIMA_SEGUNDOS);
    } catch (err) {
      console.warn("[CachedWeather] Error al guardar en caché:", (err as Error).message);
    }

    return reales;
  }
}
