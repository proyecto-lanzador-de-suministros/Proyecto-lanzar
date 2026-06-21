// ============================================================
// Caso de uso: Crear Solicitud (CU-08)
// Orquesta la creación de una solicitud y delega el control de stock a ControlarSolicitud (CU-09).
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, PrioridadSolicitud, ProductoSolicitado } from "../entities/Solicitud";
import type { PuntoGeometria } from "@/src/types/geometria";
import { ControlarSolicitud } from "./ControlarSolicitud.usecase";
import { NotificarSolicitudCreada } from "@/src/modules/notificaciones/domain/use-cases/NotificarSolicitudCreada.usecase";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

export interface CrearSolicitudInput {
  id_usuario: string;
  ubicacion_destino: PuntoGeometria;
  prioridad: PrioridadSolicitud;
  productos: ProductoSolicitado[];
  fecha_estimada?: Date;
}

export interface CrearSolicitudOutput {
  solicitud: Solicitud;
  asignada: boolean;
  stockFaltante?: string[];
}

export class CrearSolicitud {
  constructor(
    private readonly repo: ForManagingSolicitudes,
    private readonly controlarSolicitud: ControlarSolicitud,
    private readonly notificarCreada: NotificarSolicitudCreada,
    private readonly historial: ForManagingHistorial,
  ) {}

  async ejecutar(input: CrearSolicitudInput): Promise<CrearSolicitudOutput> {
    const solicitud = Solicitud.crear({
      id_solicitud: crypto.randomUUID(),
      id_usuario: input.id_usuario,
      ubicacion_destino: input.ubicacion_destino,
      prioridad: input.prioridad,
      productos: input.productos,
      fecha_estimada: input.fecha_estimada,
    });

    await this.repo.guardar(solicitud);

    // Registrar la creación en el historial de auditoría (CU-08).
    // Sin estado anterior: es el primer evento de la solicitud.
    try {
      await this.historial.registrar({
        solicitudId: solicitud.id_solicitud,
        estadoNuevo: solicitud.estado,
        actorId: solicitud.id_usuario,
      });
    } catch {
      // fire-and-forget
    }

    try {
      await this.notificarCreada.ejecutar(solicitud.id_solicitud, solicitud.id_usuario);
    } catch {
      // fire-and-forget
    }

    const resultado = await this.controlarSolicitud.ejecutar(solicitud);

    return resultado;
  }
}