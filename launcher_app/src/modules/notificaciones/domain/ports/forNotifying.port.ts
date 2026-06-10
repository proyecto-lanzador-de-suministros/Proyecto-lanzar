// Puerto de salida. Define la interfaz para enviar notificaciones a solicitantes y remitentes.
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface ForNotifying {
  notificar(params: {
    destinatario: string;
    solicitudId: string;
    estado: EstadoSolicitud;
  }): Promise<void>;
}
