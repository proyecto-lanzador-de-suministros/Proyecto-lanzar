// Adaptador driven. Implementa forNotifying orquestando los distintos canales de notificación disponibles.
import { ForNotifying } from "../../domain/ports/forNotifying.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

/**
 * Adaptador driven. Implementa ForNotifying orquestando los distintos
 * canales de notificación disponibles.
 *
 * TODO: conectar con el cliente de email/push real (ver notificationClient.ts).
 * Por ahora loguea en consola para no bloquear el resto del sistema.
 */
export class NotificationServiceAdapter implements ForNotifying {
  async notificar(params: {
    destinatario: string;
    solicitudId: string;
    estado: EstadoSolicitud;
  }): Promise<void> {
    // Stub temporal — reemplazar por la llamada real al canal de notificaciones
    console.warn(
      `[NotificationServiceAdapter] Notificación pendiente de implementar:`,
      params,
    );
  }
}