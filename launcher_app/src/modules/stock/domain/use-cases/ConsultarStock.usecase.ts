// ============================================================
// Caso de uso: Consultar Stock (CU-17)
// El admin puede consultar el stock de cualquier remitente;
// el remitente solo el propio (esa restricción la aplica el caller,
// pasando el id_base correspondiente según su rol).
// ============================================================

import { ForManagingStock, StockItem } from "../ports/forManagingStock.port";

export class ConsultarStockUseCase {
  constructor(private readonly stockRepository: ForManagingStock) {}

  async ejecutar(id_base: string): Promise<StockItem[]> {
    return this.stockRepository.consultarPorBase(id_base);
  }
}