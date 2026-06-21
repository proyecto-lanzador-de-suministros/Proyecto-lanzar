export interface NotificacionEntry {
  id_notificacion: string;
  mensaje: string;
  leida: boolean;
  fecha_hora: string;
  id_solicitud: string | null;
  id_usuario_destino: string;
}

export interface NotificacionGlobalEntry {
  id: string;
  mensaje: string;
  leida: boolean;
  fechaHora: string;
  solicitudId: string | null;
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