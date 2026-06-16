import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface RegistrarHistorialParams {
  solicitudId: string;
  estadoAnterior: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  actorId: string;
  motivo?: string;
}

/**
 * Puerto de salida. Define la interfaz para registrar cambios de estado
 * en el historial de auditoría de solicitudes.
 */
export interface ForManagingHistorial {
  registrar(params: RegistrarHistorialParams): Promise<void>;
}