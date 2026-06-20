import {
  ForManagingNotificaciones,
  NotificacionEntry,
  PaginacionNotificaciones,
} from "../ports/forManagingNotificaciones.port";

export class ListarNotificacionesUseCase {
  constructor(private readonly notificacionesRepository: ForManagingNotificaciones) {}

  async ejecutarPorUsuario(usuarioId: string): Promise<NotificacionEntry[]> {
    return this.notificacionesRepository.listarPorUsuario(usuarioId);
  }

  async ejecutarGlobal(params?: { pagina?: number }): Promise<PaginacionNotificaciones> {
    const pagina = Math.max(1, params?.pagina ?? 1);
    return this.notificacionesRepository.listarGlobal(pagina);
  }
}
