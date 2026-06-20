import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface RegistrarHistorialParams {
  solicitudId: string;
  estadoAnterior: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  actorId: string;
  motivo?: string;
}

export interface HistorialEntry {
  id: string;
  solicitudId: string;
  actorId: string;
  estadoAnterior: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  fechaHora: Date;
}

/**
 * Puerto de salida. Define la interfaz para registrar y consultar cambios de estado
 * en el historial de auditoría de solicitudes.
 */
export interface ForManagingHistorial {
  registrar(params: RegistrarHistorialParams): Promise<void>;

  /** CU-20: lista el historial de cambios de estado de una solicitud, ordenado cronológicamente. */
  listarPorSolicitud(solicitudId: string): Promise<HistorialEntry[]>;
}