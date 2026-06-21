import { Errores } from "@/src/modules/errors/domain/factories";
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingUsuarios } from "@/src/modules/usuarios/domain/ports/forManagingUsuarios.port";
import { ForManagingHistorial } from "@/src/modules/historial/domain/ports/forManagingHistorial.port";
import { NotificarAsignacion } from "@/src/modules/notificaciones/domain/use-cases/NotificarAsignacion.usecase";

export class AsignarRemitenteUseCase {
  constructor(
    private readonly solicitudRepository: ForManagingSolicitudes,
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly notificarAsignacion: NotificarAsignacion,
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
      throw Errores.remitenteNoEncontrado(remitenteId);
    }

    if (remitente.rol !== "REMITENTE") {
      throw Errores.rolInvalido(remitenteId, "REMITENTE");
    }

    if (remitente.estadoCuenta !== "APROBADA") {
      throw Errores.cuentaNoAprobada(
        remitente.nombre ?? remitenteId,
        remitente.estadoCuenta,
      );
    }

    // 2. Obtener la solicitud
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    const estadoAnterior = solicitud.estado;
    const esReasignacion = !!solicitud.id_remitente;

    // 3. Asignar o reasignar — la entidad valida la transición
    if (esReasignacion) {
      solicitud.reasignar(remitenteId);
    } else {
      solicitud.asignar(remitenteId);
    }

    // 4. Persistir
    await this.solicitudRepository.actualizar(solicitud);

    // 5. Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // 6. Notificar al solicitante y al remitente (CU-09, paso 5)
    await this.notificarAsignacion.ejecutar(
      solicitudId,
      solicitud.id_usuario,
      remitenteId,
    );
  }
}
