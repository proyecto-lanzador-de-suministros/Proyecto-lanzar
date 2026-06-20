export interface CatalogoProducto {
  id_producto: string;
  nombre: string;
  descripcion: string | null;
  peso_unitario: number;
}

export interface BaseParaStock {
  id: string;
  nombre: string;
}

export interface ForManagingProductos {
  listarCatalogo(): Promise<CatalogoProducto[]>;
  listarBases(): Promise<BaseParaStock[]>;
  buscarProductoPorIdentificador(identificador: string): Promise<CatalogoProducto | null>;
}
