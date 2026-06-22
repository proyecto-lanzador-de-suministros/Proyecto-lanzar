import type { ForCachingWeather } from "../../domain/ports/forCachingWeather.port";
import type { CondicionesClimaticas } from "../../domain/entities/Trayectoria";
import { getRedisClient } from "@/src/infrastructure/cache/redis.client";

const CLAVE_PREFIJO = "weather";

export class RedisWeatherCacheAdapter implements ForCachingWeather {
  private readonly ttlPorDefecto = 420;

  async obtener(
    lat: number,
    lon: number,
  ): Promise<CondicionesClimaticas | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
      const clave = this.generarClave(lat, lon);
      const raw = await redis.get(clave);
      if (!raw) return null;

      return JSON.parse(raw) as CondicionesClimaticas;
    } catch (err) {
      console.warn("[RedisWeatherCache] Error al leer caché:", (err as Error).message);
      return null;
    }
  }

  async guardar(
    lat: number,
    lon: number,
    datos: CondicionesClimaticas,
    ttlSegundos?: number,
  ): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      const clave = this.generarClave(lat, lon);
      const ttl = ttlSegundos ?? this.ttlPorDefecto;
      await redis.setex(clave, ttl, JSON.stringify(datos));
    } catch (err) {
      console.warn("[RedisWeatherCache] Error al guardar en caché:", (err as Error).message);
    }
  }

  private generarClave(lat: number, lon: number): string {
    return `${CLAVE_PREFIJO}:${lat.toFixed(4)}:${lon.toFixed(4)}`;
  }
}
