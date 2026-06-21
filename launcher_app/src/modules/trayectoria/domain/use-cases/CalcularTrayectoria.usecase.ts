// ============================================================
// Caso de uso: Calcular Trayectoria (CU-15)
// Orquesta la obtención de datos climáticos y el cálculo
// balístico para determinar el punto y momento de lanzamiento.
// ============================================================

import type { PuntoGeometria } from "@/src/types/geometria";
import { CondicionesClimaticas, Trayectoria } from "../entities/Trayectoria";
import type { ForCalculatingTrajectory } from "../ports/forCalculatingTrajectory.port";
import type { ForGettingWeather } from "../ports/forGettingWeather.port";

export interface CalcularTrayectoriaInput {
  id_envio: string;
  destino: PuntoGeometria;
  peso_total_kg: number;
  altitud_liberacion_m: number;
  condiciones_climaticas: CondicionesClimaticas;
  tipo_paracaidas?: string;
}

export class CalcularTrayectoria {
  constructor(
    private readonly weatherService: ForGettingWeather,
    private readonly trajectoryCalculator: ForCalculatingTrajectory,
  ) {}

  async ejecutar(input: CalcularTrayectoriaInput): Promise<Trayectoria> {
    const [lon, lat] = input.destino.coordinates;

    const condicionesClimaticas =
      await this.weatherService.obtenerPorCoordenadas(lat, lon);

    const resultado = await this.trajectoryCalculator.calcular({
      peso_total_kg: input.peso_total_kg,
      altitud_liberacion_m: input.altitud_liberacion_m,
      destino: input.destino,
      condiciones_climaticas: condicionesClimaticas,
      tipo_paracaidas: input.tipo_paracaidas,
    });

    return Trayectoria.crear({
      id_trayectoria: crypto.randomUUID(),
      id_envio: input.id_envio,
      punto_lanzamiento: resultado.punto_lanzamiento,
      offset_norte_m: resultado.offset_norte_m,
      offset_este_m: resultado.offset_este_m,
      timestamp_estimado: resultado.timestamp_estimado,
      condiciones_seguras: resultado.condiciones_seguras,
      condiciones_climaticas: condicionesClimaticas,
      altitud_liberacion_m: input.altitud_liberacion_m,
      peso_total_kg: input.peso_total_kg,
    });
  }
}
