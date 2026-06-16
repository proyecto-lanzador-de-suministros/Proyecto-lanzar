"use server";

import { revalidatePath } from "next/cache";
import { anularSolicitudUseCase, asignarRemitenteUseCase } from "../container";

export async function anularSolicitudAction(solicitudId: string, formData: FormData) {
  try {
    const motivo = formData.get("motivo") as string || "Anulado por el administrador";
    await anularSolicitudUseCase.ejecutar(solicitudId, motivo);
    
    revalidatePath("/admin/dashboard"); // Refresca la tabla del dashboard
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function asignarRemitenteAction(solicitudId: string, formData: FormData) {
  try {
    const remitenteId = formData.get("remitenteId") as string;
    if (!remitenteId) throw new Error("Debe seleccionar un remitente válido.");
    
    await asignarRemitenteUseCase.ejecutar(solicitudId, remitenteId);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}