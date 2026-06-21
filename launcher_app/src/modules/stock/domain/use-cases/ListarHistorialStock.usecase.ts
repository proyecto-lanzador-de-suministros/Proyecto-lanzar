import { ForManagingHistorialStock, HistorialStockEntry } from "../ports/forManagingHistorialStock.port";

export class ListarHistorialStockUseCase {
  constructor(private readonly historialStockRepository: ForManagingHistorialStock) {}

  async ejecutar(id_base: string): Promise<HistorialStockEntry[]> {
    return this.historialStockRepository.listarPorBase(id_base);
  }
}