// Puerto de salida (driven). Define la interfaz para delegar el cálculo
// físico de la trayectoria de caída libre (balística + resistencia aerodinámica)
// a un motor externo o librería especializada.

import type { PuntoGeometria } from "@/src/types/geometria";
import type { CondicionesClimaticas } from "../entities/Trayectoria";

export interface CalcularTrayectoriaInput {
  peso_total_kg: number;
  altitud_liberacion_m: number;
  destino: PuntoGeometria;
  condiciones_climaticas: CondicionesClimaticas;
  tipo_paracaidas?: string;
}

export interface ResultadoTrayectoria {
  punto_lanzamiento: PuntoGeometria;
  offset_norte_m: number;
  offset_este_m: number;
  timestamp_estimado: Date;
  condiciones_seguras: boolean;
}

export interface ForCalculatingTrajectory {
  calcular(input: CalcularTrayectoriaInput): Promise<ResultadoTrayectoria>;
}
