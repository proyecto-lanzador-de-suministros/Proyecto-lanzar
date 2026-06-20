import {
  ForManagingHistorial,
  PaginacionHistorial,
  FiltroHistorial,
} from "../ports/forManagingHistorial.port";

const PAGE_SIZE = 20;

export class ListarAuditoriaGlobalUseCase {
  constructor(private readonly historialRepository: ForManagingHistorial) {}

  async ejecutar(params?: {
    pagina?: number;
    estadoNuevo?: string;
  }): Promise<PaginacionHistorial> {
    const pagina = Math.max(1, params?.pagina ?? 1);
    const filtro: FiltroHistorial | undefined = params?.estadoNuevo
      ? { estadoNuevo: params.estadoNuevo as any }
      : undefined;

    return this.historialRepository.listarGlobal(pagina, filtro, PAGE_SIZE);
  }
}
