// Entidad central del dominio. Contiene las reglas de negocio de una solicitud, incluyendo las transiciones de estado válidas.
export type EstadoSolicitud =
  | "pendiente"
  | "asignada"
  | "en_camino"
  | "entregada"
  | "cancelada";

export interface Solicitud {
  id: string;
  remitente: string; // userId
  solicitante: string; // userId
  descripcion: string;
  estado: EstadoSolicitud;
  creadaEn: Date;
}
