import { ForNotifying } from "../../domain/ports/forNotifying.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

/**
 * Adaptador driven. Implementa ForNotifying orquestando los distintos
 * canales de notificación disponibles e insertando el registro en la base de datos.
 */
export class NotificationServiceAdapter implements ForNotifying {
  async notificar(params: {
    destinatario: string;
    solicitudId: string;
    estado: EstadoSolicitud;
  }): Promise<void> {
    let mensaje = "";
    const shortId = params.solicitudId.substring(0, 8).toUpperCase();

    switch (params.estado) {
      case EstadoSolicitud.Creada:
        mensaje = `Tu solicitud #${shortId} ha sido creada correctamente.`;
        break;
      case EstadoSolicitud.Asignada:
        mensaje = `La solicitud #${shortId} ha sido asignada a una base de lanzamiento.`;
        break;
      case EstadoSolicitud.EnPreparacion:
        mensaje = `El paquete de tu solicitud #${shortId} ya está en preparación.`;
        break;
      case EstadoSolicitud.Lista:
        mensaje = `El paquete de tu solicitud #${shortId} está listo para su despacho.`;
        break;
      case EstadoSolicitud.EnCamino:
        mensaje = `¡Tu paquete #${shortId} ya está en camino!`;
        break;
      case EstadoSolicitud.Lanzada:
        mensaje = `El paquete de tu solicitud #${shortId} ha sido lanzado con éxito.`;
        break;
      case EstadoSolicitud.Completada:
        mensaje = `La entrega de tu solicitud #${shortId} se ha completado correctamente.`;
        break;
      case EstadoSolicitud.Cancelada:
        mensaje = `La solicitud #${shortId} ha sido cancelada.`;
        break;
      case EstadoSolicitud.Anulada:
        mensaje = `La solicitud #${shortId} ha sido anulada por el operador.`;
        break;
      case EstadoSolicitud.Rechazada:
        mensaje = `La solicitud #${shortId} ha sido rechazada por falta de stock.`;
        break;
      default:
        mensaje = `La solicitud #${shortId} ha cambiado al estado: ${params.estado}.`;
    }

    try {
      await prisma.notificacion.create({
        data: {
          mensaje,
          id_solicitud: params.solicitudId,
          id_usuario_destino: params.destinatario,
        },
      });
      console.log(`[NotificationServiceAdapter] Notificación creada en DB para ${params.destinatario}: ${mensaje}`);
    } catch (error) {
      console.error("[NotificationServiceAdapter] Error al insertar notificación en base de datos:", error);
    }
  }
}