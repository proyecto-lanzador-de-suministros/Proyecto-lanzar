"use server";

import { revalidatePath } from "next/cache";
import { aprobarCuentaUseCase, eliminarCuentaUseCase } from "../container";

export async function aprobarCuentaAction(usuarioId: string) {
  try {
    await aprobarCuentaUseCase.ejecutar(usuarioId);
    revalidatePath("/admin/usuarios"); // Refresca la vista en el frontend
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function eliminarCuentaAction(usuarioId: string) {
  try {
    await eliminarCuentaUseCase.ejecutar(usuarioId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}