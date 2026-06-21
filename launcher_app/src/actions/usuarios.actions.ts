"use server";

import { revalidatePath } from "next/cache";
import {
  aprobarCuentaUseCase,
  rechazarCuentaUseCase,
  eliminarCuentaUseCase,
  listarUsuariosUseCase,
} from "../container";
import { EliminarConSolicitudesActivasError } from "../modules/usuarios/domain/use-cases/EliminarCuenta.usecase";

export async function aprobarCuentaAction(usuarioId: string) {
  try {
    await aprobarCuentaUseCase.ejecutar(usuarioId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Rechaza una cuenta pendiente (CU-02, Caso A). A diferencia de
 * eliminarCuentaAction, no borra el registro: lo deja en estado
 * "RECHAZADA" para mantener trazabilidad.
 */
export async function rechazarCuentaAction(usuarioId: string) {
  try {
    await rechazarCuentaUseCase.ejecutar(usuarioId);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function obtenerSolicitantesAction() {
  try {
    const usuarios = await listarUsuariosUseCase.ejecutar();
    const data = usuarios
      .filter((u) => u.rol === "SOLICITANTE" && u.estadoCuenta === "APROBADA")
      .map((u) => ({ id: u.id, nombre: u.nombre || "Solicitante sin nombre" }));
    return { success: true, data };
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

/**
 * Elimina una cuenta de usuario (CU-05).
 *
 * Devuelve `requiresConfirmation: true` si el usuario tiene solicitudes activas,
 * para que el frontend pueda mostrar la confirmación adicional requerida por CU-05.
 * En ese caso, llamar de nuevo con `forzarConActivas=true`.
 */
export async function eliminarCuentaAction(
  usuarioId: string,
  forzarConActivas = false,
) {
  try {
    await eliminarCuentaUseCase.ejecutar(usuarioId, forzarConActivas);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    if (error instanceof EliminarConSolicitudesActivasError) {
      // El frontend debe mostrar un diálogo de confirmación adicional
      return {
        success: false,
        requiresConfirmation: true,
        cantidadActivas: error.cantidadActivas,
        error: error.message,
      };
    }
    return { success: false, error: error.message };
  }
}