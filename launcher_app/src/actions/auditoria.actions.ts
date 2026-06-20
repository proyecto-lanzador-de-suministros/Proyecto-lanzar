"use server";

import { auth } from "@clerk/nextjs/server";
import { listarAuditoriaGlobalUseCase } from "../container";

export async function listarAuditoriaAction(params?: {
  pagina?: number;
  estadoNuevo?: string;
}) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const resultado = await listarAuditoriaGlobalUseCase.ejecutar(params);

    return {
      success: true,
      data: resultado.data.map((e) => ({
        id: e.id,
        solicitudId: e.solicitudId,
        destino: e.destino,
        actorId: e.actorId,
        actorNombre: e.actorNombre,
        estadoAnterior: e.estadoAnterior,
        estadoNuevo: e.estadoNuevo,
        fechaHora: e.fechaHora.toISOString(),
      })),
      paginacion: resultado.paginacion,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}