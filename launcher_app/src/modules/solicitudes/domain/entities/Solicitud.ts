export type EstadoSolicitud =
  | "creada"
  | "asignada"
  | "en_preparacion"
  | "lista"
  | "en_camino"
  | "lanzada"
  | "completada"
  | "rechazada"
  | "cancelada"
  | "anulada";

export interface Solicitud {
  id_solicitud: string;
  fecha_solicitada: Date;
  fecha_entrega: Date;
  estado: EstadoSolicitud;
  prioridad: "baja" | "media" | "alta" | "urgente";
  ubicacion_destino: {
    coordinates: [number, number]; // [longitud, latitud]
  };
  id_solicitante: string;
  id_remitente?: string | null;
}