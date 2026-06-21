"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { listarBasesRemitentesUseCase, actualizarBaseRemitenteUseCase } from "../container";

export async function listarRemitentesAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const data = await listarBasesRemitentesUseCase.ejecutar();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function actualizarBaseRemitenteAction(
  id_remitente: string,
  datos: {
    nombre?: string;
    latitud?: number;
    longitud?: number;
    capacidad_pista?: string;
  },
) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    await actualizarBaseRemitenteUseCase.ejecutar(id_remitente, datos);
    revalidatePath("/admin/remitentes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}