"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { anularSolicitudUseCase, asignarRemitenteUseCase } from "../container";

/**
 * Anula una solicitud (CU-11). Solo ejecutable por admin o remitente.
 */
export async function anularSolicitudAction(solicitudId: string, formData: FormData) {
  const { userId, sessionClaims } = await auth();

  if (!userId || (sessionClaims?.metadata?.rol !== "admin" && sessionClaims?.metadata?.rol !== "remitente")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const motivo = (formData.get("motivo") as string) || "Anulada por el administrador";
    await anularSolicitudUseCase.ejecutar(solicitudId, motivo, userId);

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Asigna un remitente aprobado a una solicitud (CU-09).
 */
export async function asignarRemitenteAction(solicitudId: string, formData: FormData) {
  const { userId, sessionClaims } = await auth();

  if (!userId || sessionClaims?.metadata?.rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const remitenteId = formData.get("remitenteId") as string;
    if (!remitenteId) throw new Error("Debe seleccionar un remitente válido.");

    await asignarRemitenteUseCase.ejecutar(solicitudId, remitenteId, userId);

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}