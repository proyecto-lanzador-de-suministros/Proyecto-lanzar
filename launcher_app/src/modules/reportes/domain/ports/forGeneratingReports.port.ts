import { EstadoSolicitud, PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

export interface FilaSolicitudReporte {
  id: string;
  fechaCreacion: string;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  baseAsignada: string;
}

export interface ResumenReporte {
  total: number;
  porEstado: Record<string, number>;
  porPrioridad: Record<string, number>;
}

export interface ReporteSolicitudes {
  filas: FilaSolicitudReporte[];
  resumen: ResumenReporte;
}

export interface FilaStockReporte {
  id: string;
  base: string;
  producto: string;
  cantidadDisponible: number;
}

export interface ForGeneratingReports {
  generarReporteSolicitudes(rango?: RangoFechas): Promise<ReporteSolicitudes>;
  generarReporteStock(): Promise<FilaStockReporte[]>;
}
