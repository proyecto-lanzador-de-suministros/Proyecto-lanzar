/**
 * Representa un punto geográfico simple mediante latitud y longitud.
 */

export interface PuntoGeometria {
  type: "Point";
  coordinates: [number, number];
}

/**
 * Tipo genérico para el destino del paquete.
 */
export type DestinoPaquete = PuntoGeometria;
