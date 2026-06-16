// ============================================================
// Entidad: Solicitud
// Basada en CU-08 (Crear), CU-09 (Controlar),
//           CU-10 (Cancelar), CU-11 (Anular)
// ============================================================

import type { PuntoGeometria } from "@/src/types/geometria";

export enum EstadoSolicitud {
  Creada = "Creada",
  // CU-09 va directo de Creada → Asignada (con stock) o Rechazada (sin stock)
  Rechazada = "Rechazada",
  Asignada = "Asignada",
  EnPreparacion = "En preparación",
  Lista = "Lista",
  EnCamino = "En camino",
  Lanzada = "Lanzada",
  Completada = "Completada",
  Cancelada = "Cancelada",
  Anulada = "Anulada",
}

export enum PrioridadSolicitud {
  Alta = "Alta",
  Media = "Media",
  Baja = "Baja",
  Urgente = "Urgente",
}

// Estados desde los que el Solicitante o Admin pueden cancelar (CU-10)
const ESTADOS_CANCELABLES = new Set([
  EstadoSolicitud.Creada,
  EstadoSolicitud.Asignada,
]);

// Estados desde los que NO se puede anular (CU-11)
const ESTADOS_NO_ANULABLES = new Set([
  EstadoSolicitud.Completada,
  EstadoSolicitud.Cancelada,
  EstadoSolicitud.Anulada,
]);

// Transiciones válidas del ciclo de vida
const TRANSICIONES_VALIDAS: Partial<Record<EstadoSolicitud, EstadoSolicitud[]>> = {
  [EstadoSolicitud.Creada]: [
    EstadoSolicitud.Asignada,   // CU-09: stock suficiente
    EstadoSolicitud.Rechazada,  // CU-09: stock insuficiente
    EstadoSolicitud.Cancelada,
  ],
  [EstadoSolicitud.Asignada]: [
    EstadoSolicitud.EnPreparacion,
    EstadoSolicitud.Cancelada,
    EstadoSolicitud.Anulada,
  ],
  [EstadoSolicitud.EnPreparacion]: [
    EstadoSolicitud.Lista,
    EstadoSolicitud.Anulada,
  ],
  [EstadoSolicitud.Lista]: [
    EstadoSolicitud.EnCamino,
    EstadoSolicitud.Anulada,
  ],
  [EstadoSolicitud.EnCamino]: [
    EstadoSolicitud.Lanzada,
    EstadoSolicitud.Anulada,
  ],
  [EstadoSolicitud.Lanzada]: [
    EstadoSolicitud.Completada,
    EstadoSolicitud.Anulada,
  ],
};

export interface ProductoSolicitado {
  productoId: string;
  cantidad: number;
}

export interface SolicitudProps {
  id_solicitud: string;
  id_usuario: string;
  id_base?: string;
  ubicacion_destino: PuntoGeometria;
  prioridad: PrioridadSolicitud;
  productos: ProductoSolicitado[];
  estado: EstadoSolicitud;
  fecha_solicitada: Date;
  fecha_estimada?: Date;
  fecha_entrega?: Date;
  motivoCancelacion?: string;
  motivoAnulacion?: string;
  fechaActualizacion: Date;
}

export class Solicitud {
  private constructor(private readonly props: SolicitudProps) {}

  // ── Factory: crea una solicitud nueva en estado Creada ──────────────────
  static crear(params: {
    id_solicitud: string;
    id_usuario: string;
    ubicacion_destino: PuntoGeometria;
    prioridad: PrioridadSolicitud;
    productos: ProductoSolicitado[];
    fecha_estimada?: Date;
  }): Solicitud {
    if (params.productos.length === 0) {
      throw new Error("La solicitud debe incluir al menos un producto.");
    }

    for (const p of params.productos) {
      if (p.cantidad <= 0) {
        throw new Error(
          `La cantidad del producto ${p.productoId} debe ser mayor a cero.`
        );
      }
    }

    const ahora = new Date();
    return new Solicitud({
      ...params,
      estado: EstadoSolicitud.Creada,
      fecha_solicitada: ahora,
      fechaActualizacion: ahora,
    });
  }

  // ── Factory: reconstruye desde persistencia ─────────────────────────────
  static reconstruir(props: SolicitudProps): Solicitud {
    return new Solicitud(props);
  }

  // ── Getters ─────────────────────────────────────────────────────────────
  get id_solicitud() { return this.props.id_solicitud; }
  get id_usuario() { return this.props.id_usuario; }
  get id_base() { return this.props.id_base; }
  get ubicacion_destino() { return this.props.ubicacion_destino; }
  get prioridad() { return this.props.prioridad; }
  get productos() { return this.props.productos; }
  get estado() { return this.props.estado; }
  get fecha_solicitada() { return this.props.fecha_solicitada; }
  get fecha_estimada() { return this.props.fecha_estimada; }
  get fecha_entrega() { return this.props.fecha_entrega; }
  get motivoCancelacion() { return this.props.motivoCancelacion; }
  get motivoAnulacion() { return this.props.motivoAnulacion; }
  get fechaActualizacion() { return this.props.fechaActualizacion; }

  // ── Métodos de negocio ──────────────────────────────────────────────────

  /** CU-09: stock OK → asigna base directamente (Creada → Asignada) */
  asignar(id_base: string): void {
    this.props.id_base = id_base;
    this.transicionarA(EstadoSolicitud.Asignada);
  }

  /** CU-09: stock insuficiente → rechaza */
  rechazar(): void {
    this.transicionarA(EstadoSolicitud.Rechazada);
  }

  /** CU-10: solicitante o admin cancela en estados tempranos */
  cancelar(motivo?: string): void {
    if (!ESTADOS_CANCELABLES.has(this.props.estado)) {
      throw new Error(
        `No se puede cancelar una solicitud en estado "${this.props.estado}".`
      );
    }
    this.props.motivoCancelacion = motivo;
    this.transicionarA(EstadoSolicitud.Cancelada);
  }

  /** CU-11: admin o remitente anula (requiere motivo para auditoría) */
  anular(motivo: string): void {
    if (ESTADOS_NO_ANULABLES.has(this.props.estado)) {
      throw new Error(
        `No se puede anular una solicitud en estado "${this.props.estado}".`
      );
    }
    this.props.motivoAnulacion = motivo;
    this.transicionarA(EstadoSolicitud.Anulada);
  }

  /** Avanza el estado en el ciclo normal (EnPreparacion → Lista → etc.) */
  avanzarEstado(nuevoEstado: EstadoSolicitud): void {
    this.transicionarA(nuevoEstado);
  }

  /** Registra la fecha real de entrega al completarse */
  confirmarEntrega(): void {
    this.transicionarA(EstadoSolicitud.Completada);
    this.props.fecha_entrega = new Date();
  }

  // ── Helpers de consulta ─────────────────────────────────────────────────

  puedeSerCancelada(): boolean {
    return ESTADOS_CANCELABLES.has(this.props.estado);
  }

  puedeSerAnulada(): boolean {
    return !ESTADOS_NO_ANULABLES.has(this.props.estado);
  }

  estaFinalizada(): boolean {
    return [
      EstadoSolicitud.Completada,
      EstadoSolicitud.Cancelada,
      EstadoSolicitud.Anulada,
      EstadoSolicitud.Rechazada,
    ].includes(this.props.estado);
  }

  // ── Validación de transición ────────────────────────────────────────────
  private transicionarA(nuevoEstado: EstadoSolicitud): void {
    const permitidos = TRANSICIONES_VALIDAS[this.props.estado] ?? [];

    if (!permitidos.includes(nuevoEstado)) {
      throw new Error(
        `Transición inválida: "${this.props.estado}" → "${nuevoEstado}".`
      );
    }

    this.props.estado = nuevoEstado;
    this.props.fechaActualizacion = new Date();
  }
}