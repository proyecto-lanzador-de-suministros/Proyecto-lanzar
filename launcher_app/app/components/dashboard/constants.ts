// Constantes y helpers visuales compartidos por los componentes del dashboard de admin.
// Centralizado acá para no repetir mapeos de color/etiqueta en cada componente.

import {
  EstadoSolicitud,
  PrioridadSolicitud,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";

// ─── Paleta del mockup ──────────────────────────────────────────────────────
// Navy #1B2A4A | Amber #F5A623 | Blue #1565C0 | Gray light #F4F6F9
// Info #2196F3 | Success #4CAF50 | Warning #FF9800 | Danger #F44336
// Text primary #1A1A2E | Text secondary #6B7280

export const ETIQUETAS_ESTADO: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.Creada]: "Creada",
  [EstadoSolicitud.Rechazada]: "Rechazada",
  [EstadoSolicitud.Asignada]: "Asignada",
  [EstadoSolicitud.EnPreparacion]: "En preparación",
  [EstadoSolicitud.Lista]: "Lista",
  [EstadoSolicitud.EnCamino]: "En camino",
  [EstadoSolicitud.Lanzada]: "Lanzada",
  [EstadoSolicitud.Completada]: "Completada",
  [EstadoSolicitud.Cancelada]: "Cancelada",
  [EstadoSolicitud.Anulada]: "Anulada",
};

/**
 * Transición de avance "natural" disponible para cada estado, según la
 * máquina de estados de la entidad Solicitud (TRANSICIONES_VALIDAS).
 * Cada estado no terminal tiene como máximo UN avance hacia adelante
 * (Cancelada/Anulada se gestionan con sus propias acciones dedicadas).
 *
 * Reemplaza al viejo selector genérico de "cambiar estado", que permitía
 * elegir transiciones inválidas y no registraba historial ni notificaba
 * (CU-12 a CU-16 exigen que cada paso quede auditado y notificado).
 */
export const TRANSICION_SIGUIENTE: Partial<
  Record<EstadoSolicitud, { estado: EstadoSolicitud; label: string }>
> = {
  [EstadoSolicitud.Asignada]: {
    estado: EstadoSolicitud.EnPreparacion,
    label: "Iniciar preparación", // CU-12
  },
  [EstadoSolicitud.EnPreparacion]: {
    estado: EstadoSolicitud.Lista,
    label: "Marcar como lista", // CU-13
  },
  [EstadoSolicitud.Lista]: {
    estado: EstadoSolicitud.EnCamino,
    label: "Registrar en camino", // CU-14
  },
  [EstadoSolicitud.EnCamino]: {
    estado: EstadoSolicitud.Lanzada,
    label: "Registrar lanzamiento", // CU-15
  },
  [EstadoSolicitud.Lanzada]: {
    estado: EstadoSolicitud.Completada,
    label: "Confirmar recepción", // CU-16
  },
};

export function getStatusColor(estado: EstadoSolicitud): string {
  switch (estado) {
    case EstadoSolicitud.Completada:
      return "bg-green-100 text-[#4CAF50] border-green-200";
    case EstadoSolicitud.EnCamino:
    case EstadoSolicitud.Lanzada:
      return "bg-blue-100 text-[#2196F3] border-blue-200";
    case EstadoSolicitud.EnPreparacion:
    case EstadoSolicitud.Lista:
      return "bg-orange-100 text-[#FF9800] border-orange-200";
    case EstadoSolicitud.Creada:
    case EstadoSolicitud.Asignada:
      return "bg-gray-100 text-[#6B7280] border-gray-200";
    default:
      return "bg-red-100 text-[#F44336] border-red-200";
  }
}

export function getPrioridadColor(prioridad: PrioridadSolicitud): string {
  switch (prioridad) {
    case PrioridadSolicitud.Alta:
      return "bg-orange-100 text-[#FF9800]";
    case PrioridadSolicitud.Media:
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-[#6B7280]";
  }
}