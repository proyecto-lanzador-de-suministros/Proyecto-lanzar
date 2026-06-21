import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface RegistrarHistorialParams {
  solicitudId: string;
  // Sin valor: representa el primer evento de la solicitud (creación),
  // que no tiene un estado previo del cual partir.
  estadoAnterior?: EstadoSolicitud;
  estadoNuevo: EstadoSolicitud;
  actorId: string;
  motivo?: string;
}

export interface HistorialEntry {
  id: string;
  solicitudId: string;
  actorId: string;
  estadoAnterior?: EstadoSolicitud;
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

export interface ForManagingHistorial {
  registrar(params: RegistrarHistorialParams): Promise<void>;
  listarPorSolicitud(solicitudId: string): Promise<HistorialEntry[]>;
  listarGlobal(pagina: number, filtro?: FiltroHistorial, pageSize?: number): Promise<PaginacionHistorial>;
}