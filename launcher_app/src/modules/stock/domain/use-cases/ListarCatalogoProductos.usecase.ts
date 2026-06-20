import { ForManagingProductos, CatalogoProducto, BaseParaStock } from "../ports/forManagingProductos.port";

export class ListarCatalogoProductosUseCase {
  constructor(private readonly productosRepository: ForManagingProductos) {}

  async ejecutarCatalogo(): Promise<CatalogoProducto[]> {
    return this.productosRepository.listarCatalogo();
  }

  async ejecutarBases(): Promise<BaseParaStock[]> {
    return this.productosRepository.listarBases();
  }

  async ejecutarBuscarProducto(identificador: string): Promise<CatalogoProducto | null> {
    return this.productosRepository.buscarProductoPorIdentificador(identificador);
  }
}
