import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";

export interface RegistrarLanzadaInput {
  solicitudId: string;
  actorId: string;
  rol: "remitente" | "admin";
}

export class RegistrarLanzadaUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notifier: ForNotifying,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Registra el lanzamiento físico de los suministros (CU-15).
   * Solo el remitente asignado o un admin pueden ejecutar esto.
   *
   * @param input Datos necesarios para el registro.
   */
  async ejecutar(input: RegistrarLanzadaInput): Promise<void> {
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

    // La entidad valida la transición (En camino -> Lanzada)
    solicitud.avanzarEstado(EstadoSolicitud.Lanzada);

    // Persistir el cambio
    await this.solicitudRepository.actualizarEstado(solicitudId, solicitud.estado);

    // Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // Notificar al solicitante (CU-15, postcondición)
    await this.notifier.notificar({
      destinatario: solicitud.id_usuario,
      solicitudId,
      estado: solicitud.estado,
    });
  }
}
