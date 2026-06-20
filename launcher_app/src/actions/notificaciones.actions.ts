"use server";

import { auth } from "@clerk/nextjs/server";
import { listarNotificacionesUseCase } from "../container";

export async function obtenerNotificacionesAction() {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const data = await listarNotificacionesUseCase.ejecutarPorUsuario(userId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listarNotificacionesGlobalAction(params?: { pagina?: number }) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const resultado = await listarNotificacionesUseCase.ejecutarGlobal(params);
    return {
      success: true,
      data: resultado.data,
      paginacion: resultado.paginacion,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}