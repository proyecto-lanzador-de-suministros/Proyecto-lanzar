import { ForManagingUsuarios } from "../ports/forManagingUsuarios.port";
import { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

// Estados que bloquean la eliminación directa (CU-05, nota en paso 3)
const ESTADOS_ACTIVOS = new Set([
  EstadoSolicitud.Creada,
  EstadoSolicitud.Asignada,
  EstadoSolicitud.EnPreparacion,
  EstadoSolicitud.Lista,
  EstadoSolicitud.EnCamino,
  EstadoSolicitud.Lanzada,
]);

export class EliminarCuentaUseCase {
  constructor(
    private readonly usuarioRepository: ForManagingUsuarios,
    private readonly solicitudRepository: ForManagingSolicitudes,
  ) {}

  /**
   * Elimina una cuenta de usuario (CU-05).
   * Si el usuario tiene solicitudes activas, lanza un error descriptivo
   * para que el frontend pueda pedir confirmación adicional al admin.
   *
   * @param usuarioId          UUID del usuario a eliminar.
   * @param forzarConActivas   Si es true, elimina incluso con solicitudes activas
   *                           (solo tras la confirmación adicional del frontend).
   */
  async ejecutar(usuarioId: string, forzarConActivas = false): Promise<void> {
    // 1. Verificar que el usuario existe
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    // 2. Verificar si tiene solicitudes activas (CU-05, paso 3 nota)
    if (!forzarConActivas) {
      const solicitudes = await this.solicitudRepository.listarPorSolicitante(usuarioId);
      const activas = solicitudes.filter((s) => ESTADOS_ACTIVOS.has(s.estado));

      if (activas.length > 0) {
        // El frontend debe mostrar la confirmación adicional y llamar de nuevo con forzarConActivas=true
        throw new EliminarConSolicitudesActivasError(
          `El usuario tiene ${activas.length} solicitud(es) activa(s). Se requiere confirmación adicional para continuar.`,
          activas.length,
        );
      }
    }

    // 3. Eliminar de la persistencia
    await this.usuarioRepository.eliminar(usuarioId);
  }
}

/**
 * Error tipado para que el handler HTTP pueda distinguirlo
 * y devolver una respuesta diferente al frontend.
 */
export class EliminarConSolicitudesActivasError extends Error {
  constructor(message: string, public readonly cantidadActivas: number) {
    super(message);
    this.name = "EliminarConSolicitudesActivasError";
  }
}