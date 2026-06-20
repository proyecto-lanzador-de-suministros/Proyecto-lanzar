import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";

export interface RegistrarEnCaminoInput {
  solicitudId: string;
  actorId: string;
  rol: "remitente" | "admin";
}

export class RegistrarEnCaminoUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notifier: ForNotifying,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Indica que la solicitud ya fue enviada y se encuentra en camino (CU-14).
   * Solo el remitente asignado o un admin pueden ejecutar esto.
   *
   * @param input Datos necesarios para el registro.
   */
  async ejecutar(input: RegistrarEnCaminoInput): Promise<void> {
    const { solicitudId, actorId, rol } = input;
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    // Verificar permisos: si es remitente, debe ser el asignado a la solicitud
    if (rol === "remitente" && solicitud.id_base !== actorId) {
      throw Errores.permisoDenegado("remitente", rol);
    }

    const estadoAnterior = solicitud.estado;

    // La entidad valida la transición (Lista -> En camino)
    solicitud.avanzarEstado(EstadoSolicitud.EnCamino);

    // Persistir el cambio
    await this.solicitudRepository.actualizarEstado(solicitudId, solicitud.estado);

    // Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // Notificar al solicitante (CU-14, postcondición)
    await this.notifier.notificar({
      destinatario: solicitud.id_usuario,
      solicitudId,
      estado: solicitud.estado,
    });
  }
}
