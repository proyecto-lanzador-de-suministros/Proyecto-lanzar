// src/modules/solicitudes/infrastructure/adapters/MockSolicitudesRepository.ts
import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import { Solicitud } from "../../domain/entities/Solicitud";

export class MockSolicitudesRepository implements ForManagingSolicitudes {
  private solicitudes: Solicitud[] = [];

  async guardar(solicitud: Solicitud): Promise<void> {
    this.solicitudes.push(solicitud);
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    return this.solicitudes.find((s) => s.id === id) ?? null;
  }

  async listarPorSolicitante(userId: string): Promise<Solicitud[]> {
    return this.solicitudes.filter((s) => s.solicitante === userId);
  }

  async listarTodas(estadoFiltro?: string): Promise<Solicitud[]> {
    if (!estadoFiltro) return this.solicitudes;
    return this.solicitudes.filter((s) => s.estado === estadoFiltro);
  }
}
