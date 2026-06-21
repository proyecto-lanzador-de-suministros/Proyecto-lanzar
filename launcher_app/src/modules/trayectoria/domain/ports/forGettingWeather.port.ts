// Puerto de salida (driven). Define la interfaz para obtener datos
// climáticos necesarios para el cálculo de trayectoria a partir de
// las coordenadas de destino.

import { CondicionesClimaticas } from "../entities/Trayectoria";

export interface ForGettingWeather {
  obtenerPorCoordenadas(
    lat: number,
    lon: number,
  ): Promise<CondicionesClimaticas>;
}
