// ============================================================
// Puerto: ForManagingHistorialStock
// Contrato para registrar y consultar el historial de cambios
// manuales de stock (CU-18, postcondición "el historial de
// actualizaciones de stock queda registrado").
// ============================================================

export interface RegistrarHistorialStockParams {
  id_remitente: string;
  id_producto: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  actorId: string;
}

export interface HistorialStockEntry {
  id: string;
  id_remitente: string;
  id_producto: string;
  nombreProducto: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  actorId: string;
  actorNombre: string;
  fechaHora: Date;
}

export interface ForManagingHistorialStock {
  registrar(params: RegistrarHistorialStockParams): Promise<void>;
  listarPorBase(id_remitente: string): Promise<HistorialStockEntry[]>;
}