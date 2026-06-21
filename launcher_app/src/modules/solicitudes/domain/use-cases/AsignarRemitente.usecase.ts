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

    // 2. Resolver la base que gestiona el remitente
    const baseId = await this.usuarioRepository.obtenerBaseDeRemitente(remitenteId);
    if (!baseId) {
      throw Errores.remitenteNoEncontrado(remitenteId);
    }

    // 3. Obtener la solicitud
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(solicitudId);
    }

    const estadoAnterior = solicitud.estado;

    // 4. Asignar o reasignar — la entidad valida la transición
    const esReasignacion = !!solicitud.id_base;
    if (esReasignacion) {
      solicitud.reasignar(baseId);
    } else {
      solicitud.asignar(baseId);
    }

    // 5. Persistir
    await this.solicitudRepository.actualizar(solicitud);

    // 6. Registrar en el historial de auditoría
    await this.historial.registrar({
      solicitudId,
      estadoAnterior,
      estadoNuevo: solicitud.estado,
      actorId,
    });

    // 7. Notificar al solicitante y al remitente
    await this.notificarAsignacion.ejecutar(
      solicitudId,
      solicitud.id_usuario,
      remitenteId,
    );
  }
}
