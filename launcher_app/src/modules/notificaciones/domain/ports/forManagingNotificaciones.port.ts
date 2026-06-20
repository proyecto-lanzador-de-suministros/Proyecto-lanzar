export interface NotificacionEntry {
  id_notificacion: string;
  mensaje: string;
  fecha_hora: string;
  id_solicitud: string;
  id_usuario_destino: string;
}

export interface NotificacionGlobalEntry {
  id: string;
  mensaje: string;
  fechaHora: string;
  solicitudId: string;
  destinatarioId: string;
  destinatarioNombre: string;
}

export interface PaginacionNotificaciones {
  data: NotificacionGlobalEntry[];
  paginacion: {
    pagina: number;
    totalPaginas: number;
    total: number;
  };
}

export interface ForManagingNotificaciones {
  listarPorUsuario(usuarioId: string): Promise<NotificacionEntry[]>;
  listarGlobal(pagina: number, pageSize?: number): Promise<PaginacionNotificaciones>;
}
