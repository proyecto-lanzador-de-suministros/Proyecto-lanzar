"use server";

import { revalidatePath } from "next/cache";
import { aprobarCuentaUseCase, eliminarCuentaUseCase, listarUsuariosUseCase } from "../container";

export async function aprobarCuentaAction(usuarioId: string) {
  try {
    await aprobarCuentaUseCase.ejecutar(usuarioId);
    revalidatePath("/admin/usuarios"); // Refresca la vista en el frontend
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function obtenerRemitentesAprobadosAction() {
  try {
    const usuarios = await listarUsuariosUseCase.ejecutar();
    const data = usuarios
      .filter((u) => u.rol === "REMITENTE" && u.estadoCuenta === "APROBADA")
      .map((u) => ({ id: u.id, nombre: u.nombre || "Base sin nombre" }));
    return { success: true, data };
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