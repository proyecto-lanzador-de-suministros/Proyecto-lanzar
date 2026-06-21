// Puerto de salida. Define la interfaz para notificar al usuario sobre el
// resultado de la revisión de su cuenta (CU-02), independiente del ciclo
// de vida de una solicitud. Existe por separado de ForNotifying porque
// ese puerto está atado a EstadoSolicitud, que no aplica acá.
export interface ForNotifyingCuenta {
  notificarAprobacion(usuarioId: string): Promise<void>;
  notificarRechazo(usuarioId: string): Promise<void>;
}