import { ForNotifying } from "../../domain/ports/forNotifying.port";
import { ForNotifyingCuenta } from "../../domain/ports/forNotifyingCuenta.port";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { sendEmail } from "@/src/infrastructure/notifications/emailSender";

async function enviarEmailAsync(
  usuarioId: string,
  subject: string,
  body: string,
): Promise<void> {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
      select: { email: true },
    });

    if (!usuario?.email) {
      console.warn(`[NotificationServiceAdapter] Usuario ${usuarioId} sin email — salteando correo.`);
      return;
    }

    await sendEmail(usuario.email, subject, body);
    console.log(`[NotificationServiceAdapter] Email enviado a ${usuario.email}: ${subject}`);
  } catch (error) {
    console.error("[NotificationServiceAdapter] Error al enviar email:", error);
  }
}

export class NotificationServiceAdapter implements ForNotifying, ForNotifyingCuenta {
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
          id_usuario: params.destinatario,
        },
      });

      enviarEmailAsync(
        params.destinatario,
        `Actualización de solicitud #${shortId}`,
        mensaje,
      );

      console.log(`[NotificationServiceAdapter] Notificación creada en DB para ${params.destinatario}: ${mensaje}`);
    } catch (error) {
      console.error("[NotificationServiceAdapter] Error al insertar notificación en base de datos:", error);
    }
  }

  async notificarAprobacion(usuarioId: string): Promise<void> {
    await this.crearNotificacionDeCuenta(
      usuarioId,
      "Tu cuenta fue aprobada. Ya podés acceder al sistema con tu rol asignado.",
    );
  }

  async notificarRechazo(usuarioId: string): Promise<void> {
    await this.crearNotificacionDeCuenta(
      usuarioId,
      "Tu cuenta fue rechazada por un administrador. Contactá a soporte si creés que se trata de un error.",
    );
  }

  private async crearNotificacionDeCuenta(usuarioId: string, mensaje: string): Promise<void> {
    try {
      await prisma.notificacion.create({
        data: {
          mensaje,
          id_usuario: usuarioId,
        },
      });

      enviarEmailAsync(
        usuarioId,
        "Estado de tu cuenta — Launcher",
        mensaje,
      );

      console.log(`[NotificationServiceAdapter] Notificación de cuenta creada en DB para ${usuarioId}: ${mensaje}`);
    } catch (error) {
      console.error("[NotificationServiceAdapter] Error al insertar notificación de cuenta:", error);
    }
  }
}
