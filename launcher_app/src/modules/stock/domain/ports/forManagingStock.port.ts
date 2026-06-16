// ============================================================
// Puerto: ForManagingStock
// Contrato para verificar disponibilidad, reservar y liberar
// stock. Usado por ControlarSolicitud (CU-09) y
// CancelarSolicitud (CU-10).
// ============================================================

import type { PuntoGeometria } from "@/src/types/geometria";
import type { ProductoSolicitado } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface VerificarYReservarInput {
  ubicacion_destino: PuntoGeometria;
  productos: ProductoSolicitado[];
}

export interface VerificarYReservarOutput {
  disponible: boolean;
  id_base?: string;            // base asignada si hay stock
  productosFaltantes?: string[]; // IDs de productos sin stock suficiente
}

export interface LiberarReservaInput {
  id_base: string;
  productos: ProductoSolicitado[];
}

export interface ForManagingStock {
  /** CU-09: busca la base más cercana con stock y reserva los productos */
  verificarYReservar(input: VerificarYReservarInput): Promise<VerificarYReservarOutput>;

  /** CU-10/11: libera la reserva cuando una solicitud es cancelada o anulada */
  liberarReserva(input: LiberarReservaInput): Promise<void>;

  /** Consulta el stock disponible de una base */
  consultarPorBase(id_base: string): Promise<{ productoId: string; cantidad_disponible: number; cantidad_reservada: number }[]>;
}