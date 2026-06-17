import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingUsuarios } from "@/src/modules/usuarios/domain/ports/forManagingUsuarios.port";
import { ForNotifying } from "@/src/modules/notificaciones/domain/ports/forNotifying.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";

export class AsignarRemitenteUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly notifier: ForNotifying,
    private readonly historial: ForManagingHistorial,
  ) {}

  /**
   * Asigna un remitente aprobado a una solicitud (CU-09).
   * Valida en el backend que el remitente exista y esté APROBADO,
   * independientemente de lo que filtre el frontend.
   *
   * @param solicitudId  UUID de la solicitud.
   * @param remitenteId  UUID del remitente a asignar.
   * @param actorId      ID del admin que ejecuta la asignación (para el historial).
   */
  async ejecutar(
    solicitudId: string,
    remitenteId: string,
    actorId: string,
  ): Promise<void> {
    // 1. Verificar que el remitente existe y está aprobado
    const remitente = await this.usuarioRepository.buscarPorId(remitenteId);

    if (!remitente) {
      throw new Error(`Remitente con ID ${remitenteId} no encontrado.`);
    }

    if (remitente.rol !== "REMITENTE") {
      throw new Error(
        `El usuario ${remitenteId} no tiene el rol de Remitente.`,
      );
    }

    if (remitente.estadoCuenta !== "APROBADA") {
      throw new Error(
        `El remitente ${remitente.nombre ?? remitenteId} no está aprobado (estado: ${remitente.estadoCuenta}).`,
      );
    }

    // 2. Obtener la solicitud
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw new Error(`Solicitud con ID ${solicitudId} no encontrada.`);
    }

    const estadoAnterior = solicitud.estado;
    ////!!!! TODO : porqué se mapea id_remitente -> id_base ??? (solicitud.asignar(base_id))
    // 3. Asignar — la entidad valida la transición (Creada → Asignada)
    solicitud.asignar(remitenteId);

    // 4. Persistir
    await this.solicitudRepository.guardar(solicitud);

    // 5. Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // 6. Notificar al solicitante y al remitente (CU-09, paso 5)
    await this.notifier.notificar({
      destinatario: solicitud.id_usuario,
      solicitudId,
      estado: solicitud.estado,
    });
    await this.notifier.notificar({
      destinatario: remitenteId,
      solicitudId,
      estado: solicitud.estado,
    });
  }
}
