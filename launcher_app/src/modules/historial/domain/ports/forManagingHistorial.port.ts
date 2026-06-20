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

export interface HistorialEntryConNombre extends HistorialEntry {
  actorNombre: string;
  destino: { lat: number; lon: number };
}

export interface PaginacionHistorial {
  data: HistorialEntryConNombre[];
  paginacion: {
    pagina: number;
    totalPaginas: number;
    total: number;
  };
}

export type FiltroHistorial = {
  estadoNuevo?: EstadoSolicitud;
};

/**
 * Puerto de salida. Define la interfaz para registrar y consultar cambios de estado
 * en el historial de auditoría de solicitudes.
 */
export interface ForManagingHistorial {
  registrar(params: RegistrarHistorialParams): Promise<void>;

  /** CU-20: lista el historial de cambios de estado de una solicitud, ordenado cronológicamente. */
  listarPorSolicitud(solicitudId: string): Promise<HistorialEntry[]>;

  /** Vista global paginada para admin con nombres de actores y destino */
  listarGlobal(pagina: number, filtro?: FiltroHistorial, pageSize?: number): Promise<PaginacionHistorial>;
}