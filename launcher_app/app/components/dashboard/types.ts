// Tipos compartidos por los componentes del dashboard de admin.

import {
  EstadoSolicitud,
  PrioridadSolicitud,
  ProductoSolicitado,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";

/**
 * Forma que tiene una Solicitud una vez que pasó por Response.json() en el
 * Route Handler. Los getters de la clase de dominio se serializan como
 * propiedades planas, pero las fechas llegan como strings ISO (no Date).
 */
export interface SolicitudJSON {
  id: string;
  solicitanteId: string;
  latDestino: number;
  lonDestino: number;
  prioridad: PrioridadSolicitud;
  productos: ProductoSolicitado[];
  estado: EstadoSolicitud;
  baseId?: string;
  motivoCancelacion?: string;
  motivoAnulacion?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface RemitenteOption {
  id: string;
  nombre: string;
}

export interface ActividadItem {
  id: string;
  tipo: "solicitud_creada" | "entregada" | "cancelada";
  titulo: string;
  descripcion: string;
  hora: string;
}