// ============================================================
// Adaptador: MockSolicitudesRepository
// Implementación en memoria para tests. Implementa ForManagingSolicitudes.
// ============================================================

import { ForManagingSolicitudes } from "../../domain/ports/forManagingSolicitudes.port";
import { Solicitud, EstadoSolicitud } from "../../domain/entities/Solicitud";

export class MockSolicitudesRepository implements ForManagingSolicitudes {
  private solicitudes: Solicitud[] = [];

  async guardar(solicitud: Solicitud): Promise<void> {
    const index = this.solicitudes.findIndex(
      (s) => s.id_solicitud === solicitud.id_solicitud
    );
    if (index >= 0) {
      this.solicitudes[index] = solicitud;
    } else {
      this.solicitudes.push(solicitud);
    }
  }

  async buscarPorId(id: string): Promise<Solicitud | null> {
    return this.solicitudes.find((s) => s.id_solicitud === id) ?? null;
  }

  async listarPorSolicitante(userId: string): Promise<Solicitud[]> {
    return this.solicitudes.filter((s) => s.id_usuario === userId);
  }

  async listarTodas(estadoFiltro?: string): Promise<Solicitud[]> {
    if (!estadoFiltro) return this.solicitudes;
    return this.solicitudes.filter((s) => s.estado === estadoFiltro);
  }

  async listarPorBase(id_base: string): Promise<Solicitud[]> {
    return this.solicitudes.filter((s) => s.id_base === id_base);
  }

  async listarPendientes(id_base: string): Promise<Solicitud[]> {
    return this.solicitudes.filter(
      (s) => s.id_base === id_base && s.estado === EstadoSolicitud.Asignada
    );
  }

  async actualizarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    extras?: {
      motivoCancelacion?: string;
      motivoAnulacion?: string;
      id_base?: string;
      fecha_entrega?: Date;
    }
  ): Promise<void> {
    const solicitud = await this.buscarPorId(id);
    if (!solicitud) throw new Error(`Solicitud ${id} no encontrada.`);

    solicitud.avanzarEstado(nuevoEstado);
  }
}