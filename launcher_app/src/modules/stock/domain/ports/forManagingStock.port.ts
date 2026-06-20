// ============================================================
// Puerto: ForManagingStock
// Contrato para verificar disponibilidad, reservar, liberar y
// actualizar manualmente el stock. Usado por ControlarSolicitud
// (CU-09), CancelarSolicitud (CU-10), y por la gestión administrativa
// de stock (CU-17, CU-18).
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

export interface StockItem {
  productoId: string;
  nombreProducto: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
}

export interface ForManagingStock {
  /** CU-09: busca la base más cercana con stock y reserva los productos */
  verificarYReservar(input: VerificarYReservarInput): Promise<VerificarYReservarOutput>;

  /** CU-10/11: libera la reserva cuando una solicitud es cancelada o anulada */
  liberarReserva(input: LiberarReservaInput): Promise<void>;

  /** CU-17: consulta el stock disponible de una base, con nombre de producto */
  consultarPorBase(id_base: string): Promise<StockItem[]>;

  /**
   * CU-18: fija la cantidad disponible de un producto en una base a un valor
   * absoluto. La semántica de "sumar/restar" se resuelve en el caso de uso,
   * que calcula el nuevo total antes de llamar a este método.
   */
  actualizarCantidad(id_base: string, productoId: string, nuevaCantidad: number): Promise<void>;
}