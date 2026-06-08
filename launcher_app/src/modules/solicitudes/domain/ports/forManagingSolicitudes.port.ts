// Puerto de salida. Define la interfaz que el dominio usa para persistir y recuperar solicitudes, sin saber que existe Prisma.
import { Solicitud } from "../entities/Solicitud";

export interface ForManagingSolicitudes {
  guardar(solicitud: Solicitud): Promise<void>;
  buscarPorId(id: string): Promise<Solicitud | null>;
  listarPorSolicitante(userId: string): Promise<Solicitud[]>;
}
