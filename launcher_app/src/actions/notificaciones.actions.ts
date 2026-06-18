"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/db/prisma.client";

export async function obtenerNotificacionesAction() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { id_usuario_destino: userId },
      orderBy: { fecha_hora: "desc" },
    });

    return {
      success: true,
      data: notificaciones.map((n) => ({
        id_notificacion: n.id_notificacion,
        mensaje: n.mensaje,
        fecha_hora: n.fecha_hora.toISOString(),
        id_solicitud: n.id_solicitud,
        id_usuario_destino: n.id_usuario_destino,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
