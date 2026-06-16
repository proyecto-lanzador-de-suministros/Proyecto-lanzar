// ============================================================
// Entidad: Solicitud
// Basada en CU-08 (Crear), CU-09 (Controlar),
//           CU-10 (Cancelar), CU-11 (Anular)
// ============================================================

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
}

// Estados desde los que el Solicitante o Admin pueden cancelar (CU-10)
const ESTADOS_CANCELABLES = new Set([
  EstadoSolicitud.Creada,
  EstadoSolicitud.Asignada,
]);

// Estados desde los que Admin o Remitente pueden anular (CU-11)
const ESTADOS_NO_ANULABLES = new Set([
  EstadoSolicitud.Completada,
  EstadoSolicitud.Cancelada,
  EstadoSolicitud.Anulada,
]);

// Transiciones válidas del ciclo de vida normal
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
  id: string;
  solicitanteId: string;
  latDestino: number;
  lonDestino: number;
  prioridad: PrioridadSolicitud;
  productos: ProductoSolicitado[];
  estado: EstadoSolicitud;
  remitenteId?: string;
  motivoCancelacion?: string;
  motivoAnulacion?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class Solicitud {
  private constructor(private readonly props: SolicitudProps) {}

  // ── Factory: crea una solicitud nueva en estado Creada ──────────────────
  static crear(params: {
    id: string;
    solicitanteId: string;
    latDestino: number;
    lonDestino: number;
    prioridad: PrioridadSolicitud;
    productos: ProductoSolicitado[];
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
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
    });
  }

  // ── Factory: reconstruye una solicitud desde persistencia ───────────────
  static reconstruir(props: SolicitudProps): Solicitud {
    return new Solicitud(props);
  }

  // ── Getters ─────────────────────────────────────────────────────────────
  get id() { return this.props.id; }
  get solicitanteId() { return this.props.solicitanteId; }
  get latDestino() { return this.props.latDestino; }
  get lonDestino() { return this.props.lonDestino; }
  get prioridad() { return this.props.prioridad; }
  get productos() { return this.props.productos; }
  get estado() { return this.props.estado; }
  get remitenteId() { return this.props.remitenteId; }
  get motivoCancelacion() { return this.props.motivoCancelacion; }
  get motivoAnulacion() { return this.props.motivoAnulacion; }
  get fechaCreacion() { return this.props.fechaCreacion; }
  get fechaActualizacion() { return this.props.fechaActualizacion; }

  // ── Métodos de negocio ──────────────────────────────────────────────────

  /** CU-09: stock OK → asigna remitente directamente (Creada → Asignada) */
  asignar(remitenteId: string): void {
    this.props.remitenteId = remitenteId;
    this.transicionarA(EstadoSolicitud.Asignada);
  }

  /** CU-09: stock insuficiente → rechaza */
  rechazar(): void {
    this.transicionarA(EstadoSolicitud.Rechazada);
  }

  /** CU-10: el solicitante o admin cancela en estados tempranos */
  cancelar(motivo?: string): void {
    if (!ESTADOS_CANCELABLES.has(this.props.estado)) {
      throw new Error(
        `No se puede cancelar una solicitud en estado "${this.props.estado}".`
      );
    }
    this.props.motivoCancelacion = motivo;
    this.transicionarA(EstadoSolicitud.Cancelada);
  }

  /** CU-11: admin o remitente anula en estados avanzados */
  anular(motivo: string): void {
    if (ESTADOS_NO_ANULABLES.has(this.props.estado)) {
      throw new Error(
        `No se puede anular una solicitud en estado "${this.props.estado}".`
      );
    }
    this.props.motivoAnulacion = motivo;
    this.transicionarA(EstadoSolicitud.Anulada);
  }

  /** Avanza al siguiente estado del ciclo normal (En preparación → Lista → etc.) */
  avanzarEstado(nuevoEstado: EstadoSolicitud): void {
    this.transicionarA(nuevoEstado);
  }

  // ── Helpers de consulta ─────────────────────────────────────────────────

  puedeSerCancelada(): boolean {
    return ESTADOS_CANCELABLES.has(this.props.estado);
  }

  puedeSerAnulada(): boolean {
    return !ESTADOS_NO_ANULABLES.has(this.props.estado);
  }

  estaFinalizada(): boolean {
    return (
      this.props.estado === EstadoSolicitud.Completada ||
      this.props.estado === EstadoSolicitud.Cancelada ||
      this.props.estado === EstadoSolicitud.Anulada ||
      this.props.estado === EstadoSolicitud.Rechazada
    );
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