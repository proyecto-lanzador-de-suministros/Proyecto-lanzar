// Entidad central del dominio. Contiene las reglas de negocio de una solicitud, incluyendo las transiciones de estado válidas.
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
  id: string;
  remitente: string; // userId
  solicitante: string; // userId
  descripcion: string;
  estado: EstadoSolicitud;
  creadaEn: Date;
}
