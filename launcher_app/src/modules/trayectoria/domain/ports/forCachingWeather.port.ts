import type { CondicionesClimaticas } from "../entities/Trayectoria";

export interface ForCachingWeather {
  obtener(
    lat: number,
    lon: number,
  ): Promise<CondicionesClimaticas | null>;

  guardar(
    lat: number,
    lon: number,
    datos: CondicionesClimaticas,
    ttlSegundos: number,
  ): Promise<void>;
}
