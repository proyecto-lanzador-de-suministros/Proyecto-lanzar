// Adaptador driven. Implementa ForCalculatingTrajectory con cálculo
// simplificado de caída libre + deriva por viento.

import type { PuntoGeometria } from "@/src/types/geometria";
import type {
  CalcularTrayectoriaInput,
  ForCalculatingTrajectory,
  ResultadoTrayectoria,
} from "../../domain/ports/forCalculatingTrajectory.port";

const GRAVEDAD = 9.81;
const METROS_POR_GRADO_LAT = 111_320;
const VIENTO_MAXIMO_SEGURO = 15;

export class TrajectoryCalculatorAdapter implements ForCalculatingTrajectory {
  async calcular(
    input: CalcularTrayectoriaInput,
  ): Promise<ResultadoTrayectoria> {
    const tiempoCaida = Math.sqrt((2 * input.altitud_liberacion_m) / GRAVEDAD);

    const drift =
      input.condiciones_climaticas.velocidad_viento_ms * tiempoCaida;
    const dirRad =
      (input.condiciones_climaticas.direccion_viento_grados * Math.PI) / 180;

    const offsetNorte = drift * Math.cos(dirRad);
    const offsetEste = drift * Math.sin(dirRad);

    const [lonDest, latDest] = input.destino.coordinates;
    const latRad = (latDest * Math.PI) / 180;

    const latLanzamiento = latDest + offsetNorte / METROS_POR_GRADO_LAT;
    const lonLanzamiento =
      lonDest + offsetEste / (METROS_POR_GRADO_LAT * Math.cos(latRad));

    const puntoLanzamiento: PuntoGeometria = {
      type: "Point",
      coordinates: [lonLanzamiento, latLanzamiento],
    };

    const timestampEstimado = new Date(Date.now() + tiempoCaida * 1000);

    const condicionesSeguras =
      input.condiciones_climaticas.velocidad_viento_ms < VIENTO_MAXIMO_SEGURO;

    return {
      punto_lanzamiento: puntoLanzamiento,
      offset_norte_m: offsetNorte,
      offset_este_m: offsetEste,
      timestamp_estimado: timestampEstimado,
      condiciones_seguras: condicionesSeguras,
    };
  }
}
