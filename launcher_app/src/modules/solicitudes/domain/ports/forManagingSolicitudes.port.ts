import { Solicitud } from "../entities/Solicitud";

export interface ForManagingSolicitudes {
  guardar(solicitud: Solicitud): Promise<void>;
  buscarPorId(id: string): Promise<Solicitud | null>;
  listarPorSolicitante(userId: string): Promise<Solicitud[]>;
  listarTodas(estadoFiltro?: string): Promise<Solicitud[]>;
}