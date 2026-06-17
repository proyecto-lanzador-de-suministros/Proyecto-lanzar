// ============================================================
// Caso de uso: Crear Solicitud (CU-08)
// Orquesta la creación de una solicitud y delega el control de stock a ControlarSolicitud (CU-09).
// ============================================================

import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud, PrioridadSolicitud, ProductoSolicitado } from "../entities/Solicitud";
import type { PuntoGeometria } from "@/src/types/geometria";
import { ControlarSolicitud } from "./ControlarSolicitud.usecase";
import { NotificarSolicitudCreada } from "@/src/modules/notificaciones/domain/use-cases/NotificarSolicitudCreada.usecase";

export interface CrearSolicitudInput {
  id_usuario: string;
  ubicacion_destino: PuntoGeometria;
  prioridad: PrioridadSolicitud;
  productos: ProductoSolicitado[];
  fecha_estimada?: Date;
}

export interface CrearSolicitudOutput {
  solicitud: Solicitud;
  asignada: boolean;       // true si hubo stock, false si fue rechazada
  stockFaltante?: string[]; // IDs de productos sin stock suficiente
}

export class CrearSolicitud {
  constructor(
    private readonly repo: ForManagingSolicitudes,
    private readonly controlarSolicitud: ControlarSolicitud,
    private readonly notificarCreada: NotificarSolicitudCreada,
  ) {}

  async ejecutar(input: CrearSolicitudInput): Promise<CrearSolicitudOutput> {
    // 1. Crear la entidad en estado "Creada" — acá se validan productos y cantidades
    const solicitud = Solicitud.crear({
      id_solicitud: crypto.randomUUID(),
      id_usuario: input.id_usuario,
      ubicacion_destino: input.ubicacion_destino,
      prioridad: input.prioridad,
      productos: input.productos,
      fecha_estimada: input.fecha_estimada,
    });

    // 2. Persistir en estado "creada"
    await this.repo.guardar(solicitud);

    // 3. Notificar al solicitante — best-effort, no debe romper el flujo
    try {
      await this.notificarCreada.ejecutar(solicitud.id_solicitud, solicitud.id_usuario);
    } catch {
      // fire-and-forget: la notificación es best-effort
    }

    // 4. Delegar control de stock y asignación a CU-09
    const resultado = await this.controlarSolicitud.ejecutar(solicitud);

    return resultado;
  }
}