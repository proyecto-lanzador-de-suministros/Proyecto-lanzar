import { Solicitud } from "../entities/Solicitud";
import type { EstadoSolicitud } from "../entities/Solicitud";

export interface ForManagingSolicitudes {
  guardar(solicitud: Solicitud): Promise<void>;
  actualizar(solicitud: Solicitud): Promise<void>;
  buscarPorId(id: string): Promise<Solicitud | null>;
  listarPorSolicitante(userId: string): Promise<Solicitud[]>;
  listarTodas(estadoFiltro?: string): Promise<Solicitud[]>;
  listarPorBase(id_base: string): Promise<Solicitud[]>;
  listarPendientes(id_base: string): Promise<Solicitud[]>;
  actualizarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    extras?: {
      motivoCancelacion?: string;
      motivoAnulacion?: string;
      id_base?: string;
      fecha_entrega?: Date;
    }
  ): Promise<void>;
}