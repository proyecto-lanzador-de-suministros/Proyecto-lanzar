// ============================================================
// Entidad: Trayectoria
// Modela el resultado del cálculo de trayectoria de caída libre
// para un lanzamiento, incluyendo el punto de liberación (CARP),
// offset estimado y validación de seguridad.
// Basada en el Pipeline de Datos (Cálculo de Trayectoria) y CU-15
// ============================================================

import type { PuntoGeometria } from "@/src/types/geometria";

export interface CondicionesClimaticas {
  velocidad_viento_ms: number;
  direccion_viento_grados: number;
  presion_atmosferica_hPa: number;
  altitud_terreno_m: number;
  temperatura_c: number;
}
export interface TrayectoriaProps {
  id_trayectoria: string;
  id_envio: string;
  punto_lanzamiento: PuntoGeometria;
  offset_norte_m: number;
  offset_este_m: number;
  timestamp_estimado: Date;
  condiciones_seguras: boolean;
  condiciones_climaticas: CondicionesClimaticas;
  altitud_liberacion_m: number;
  peso_total_kg: number;
  created_at: Date;
}

export class Trayectoria {
  private constructor(private readonly props: TrayectoriaProps) {}

  static crear(params: {
    id_trayectoria: string;
    id_envio: string;
    punto_lanzamiento: PuntoGeometria;
    offset_norte_m: number;
    offset_este_m: number;
    timestamp_estimado: Date;
    condiciones_seguras: boolean;
    condiciones_climaticas: CondicionesClimaticas;
    altitud_liberacion_m: number;
    peso_total_kg: number;
  }): Trayectoria {
    return new Trayectoria({
      ...params,
      created_at: new Date(),
    });
  }

  static reconstruir(props: TrayectoriaProps): Trayectoria {
    return new Trayectoria(props);
  }

  get id_trayectoria() {
    return this.props.id_trayectoria;
  }
  get id_envio() {
    return this.props.id_envio;
  }
  get punto_lanzamiento() {
    return this.props.punto_lanzamiento;
  }
  get offset_norte_m() {
    return this.props.offset_norte_m;
  }
  get offset_este_m() {
    return this.props.offset_este_m;
  }
  get timestamp_estimado() {
    return this.props.timestamp_estimado;
  }
  get condiciones_seguras() {
    return this.props.condiciones_seguras;
  }
  get condiciones_climaticas() {
    return this.props.condiciones_climaticas;
  }
  get altitud_liberacion_m() {
    return this.props.altitud_liberacion_m;
  }
  get peso_total_kg() {
    return this.props.peso_total_kg;
  }
  get created_at() {
    return this.props.created_at;
  }
}
