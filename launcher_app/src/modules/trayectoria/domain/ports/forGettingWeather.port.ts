// Puerto de salida (driven). Define la interfaz para obtener datos
// climáticos necesarios para el cálculo de trayectoria a partir de
// las coordenadas de destino.

export interface CondicionesClimaticas {
  velocidad_viento_ms: number;
  direccion_viento_grados: number;
  presion_atmosferica_hPa: number;
  altitud_terreno_m: number;
}

export interface ForGettingWeather {
  obtenerPorCoordenadas(lat: number, lon: number): Promise<CondicionesClimaticas>;
}
