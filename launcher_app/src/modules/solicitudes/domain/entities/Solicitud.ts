import type { PuntoGeometria } from "@/src/types/geometria";

export type Prioridad = "baja" | "media" | "alta" | "urgente";

export type EstadoSolicitud =
  | "creada"
  | "cancelada"
  | "rechazada"
  | "asignada"
  | "en_preparacion"
  | "anulada"
  | "lista"
  | "en_camino"
  | "lanzada"
  | "completada";

export interface Solicitud {
  id_solicitud: string;
  id_base: string;
  id_usuario: string;
  fecha_solicitada: Date;
  estado: EstadoSolicitud;
  prioridad: Prioridad;
  ubicacion_destino: PuntoGeometria;
  fecha_entrega: Date;
  fecha_estimada: Date;
}
