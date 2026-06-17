"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import {
  anularSolicitudUseCase,
  asignarRemitenteUseCase,
  registrarEnPreparacionUseCase,
  registrarListaUseCase,
  registrarEnCaminoUseCase,
  registrarLanzadaUseCase,
  confirmarRecibidaUseCase,
} from "../container";

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
 * Inicia la preparación de una solicitud (CU-12).
 */
export async function registrarEnPreparacionAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "remitente" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    await registrarEnPreparacionUseCase.ejecutar({
      solicitudId,
      actorId: userId,
      rol: rol as "remitente" | "admin",
    });

    revalidatePath("/remitente/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Marca una solicitud como lista (CU-13).
 */
export async function registrarListaAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "remitente" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    await registrarListaUseCase.ejecutar({
      solicitudId,
      actorId: userId,
      rol: rol as "remitente" | "admin",
    });

    revalidatePath("/remitente/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Marca una solicitud como en camino (CU-14).
 */
export async function registrarEnCaminoAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "remitente" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    await registrarEnCaminoUseCase.ejecutar({
      solicitudId,
      actorId: userId,
      rol: rol as "remitente" | "admin",
    });

    revalidatePath("/remitente/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Registra el lanzamiento de una solicitud (CU-15).
 */
export async function registrarLanzadaAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "remitente" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    await registrarLanzadaUseCase.ejecutar({
      solicitudId,
      actorId: userId,
      rol: rol as "remitente" | "admin",
    });

    revalidatePath("/remitente/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Confirma la recepción de una solicitud (CU-16).
 */
export async function confirmarRecibidaAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "solicitante" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    await confirmarRecibidaUseCase.ejecutar({
      solicitudId,
      actorId: userId,
      rol: rol as "solicitante" | "admin",
    });

    revalidatePath("/solicitante/dashboard");
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