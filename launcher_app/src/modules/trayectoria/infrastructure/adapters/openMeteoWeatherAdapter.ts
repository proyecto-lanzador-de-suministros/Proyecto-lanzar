// infrastructure/adapters/openMeteoWeather.adapter.ts
//
// Adaptador driven. Implementa ForGettingWeather consultando la API
// pública de Open-Meteo (sin necesidad de API key).
import type { ForGettingWeather } from "../../domain/ports/forGettingWeather.port";
import type { CondicionesClimaticas } from "../../domain/entities/Trayectoria";

interface OpenMeteoCurrentResponse {
  elevation: number;
  current: {
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    temperature_2m: number;
  };
}

export class OpenMeteoWeatherAdapter implements ForGettingWeather {
  private readonly baseUrl = "https://api.open-meteo.com/v1/forecast";

  async obtenerPorCoordenadas(
    lat: number,
    lon: number,
  ): Promise<CondicionesClimaticas> {
    const url = this.construirUrl(lat, lon);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo respondió con error ${response.status}`);
    }

    const data: OpenMeteoCurrentResponse = await response.json();
    return this.mapearAModelo(data);
  }

  private construirUrl(lat: number, lon: number): string {
    const qs = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current:
        "wind_speed_10m,wind_direction_10m,surface_pressure,temperature_2m",
      wind_speed_unit: "ms",
    });

    return `${this.baseUrl}?${qs.toString()}`;
  }

  private mapearAModelo(data: OpenMeteoCurrentResponse): CondicionesClimaticas {
    return {
      velocidad_viento_ms: data.current.wind_speed_10m,
      direccion_viento_grados: data.current.wind_direction_10m,
      presion_atmosferica_hPa: data.current.surface_pressure,
      altitud_terreno_m: data.elevation,
      temperatura_c: data.current.temperature_2m,
    };
  }
}
