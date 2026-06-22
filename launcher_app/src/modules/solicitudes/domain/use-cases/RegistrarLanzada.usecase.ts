import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { EstadoSolicitud } from "../entities/Solicitud";
import { NotificarLanzada } from "@/src/modules/notificaciones/domain/use-cases/NotificarLanzada.usecase";
import { ForManagingUsuarios } from "@/src/modules/usuarios/domain/ports/forManagingUsuarios.port";

export interface RegistrarLanzadaInput {
  solicitudId: string;
  actorId: string;
  rol: "remitente" | "admin";
}

export class RegistrarLanzadaUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly notificarLanzada: NotificarLanzada,
    private readonly historial: ForManagingHistorial,
    private readonly usuarioRepository: ForManagingUsuarios,
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
    if (rol === "remitente") {
      const usuario = await this.usuarioRepository.buscarPorId(actorId);
      if (!usuario || usuario.idBase !== solicitud.id_base) {
        throw Errores.permisoDenegado("remitente", rol);
      }
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
    await this.notificarLanzada.ejecutar(solicitudId, solicitud.id_usuario);
  }
}
