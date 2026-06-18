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
  crearSolicitudUseCase,
  cancelarSolicitudUseCase,
  consultarSolicitudUseCase,
  consultarSolicitudesPendientesUseCase,
} from "../container";
import { PrioridadSolicitud, type ProductoSolicitado } from "../modules/solicitudes/domain/entities/Solicitud";
import type { PuntoGeometria } from "../types/geometria";
import { prisma } from "../infrastructure/db/prisma.client";

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

/**
 * Crea una nueva solicitud (CU-08).
 * Solo ejecutable por solicitantes.
 */
export async function crearSolicitudAction(data: {
  ubicacion_destino: PuntoGeometria;
  prioridad: PrioridadSolicitud;
  productos: ProductoSolicitado[];
  fecha_estimada?: Date;
}) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "solicitante") {
    return { success: false, error: "No autorizado. Se requiere rol solicitante." };
  }

  try {
    const resultado = await crearSolicitudUseCase.ejecutar({
      id_usuario: userId,
      ubicacion_destino: data.ubicacion_destino,
      prioridad: data.prioridad,
      productos: data.productos,
      fecha_estimada: data.fecha_estimada,
    });

    revalidatePath("/solicitante/solicitudes");
    return { success: true, data: resultado };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancela una solicitud propia en estados tempranos (CU-10).
 * Ejecutable por solicitante (solo las propias) o admin (cualquiera).
 */
export async function cancelarSolicitudAction(solicitudId: string, motivo?: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "solicitante" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    await cancelarSolicitudUseCase.ejecutar({
      id_solicitud: solicitudId,
      id_usuario: userId,
      rol: rol as "solicitante" | "admin",
      motivo,
    });

    revalidatePath("/solicitante/solicitudes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Consulta el detalle de una solicitud (CU-20).
 * Solicitante ve solo las propias, remitente las de su base, admin todas.
 */
export async function consultarSolicitudAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || !rol) {
    return { success: false, error: "No autenticado." };
  }

  try {
    let id_base: string | undefined;

    if (rol === "remitente") {
      const remitente = await prisma.remitente.findUnique({
        where: { id_remitente: userId },
        select: { id_remitente: true },
      });
      id_base = remitente?.id_remitente ?? undefined;
    }

    const solicitud = await consultarSolicitudUseCase.ejecutar({
      id_solicitud: solicitudId,
      id_usuario: userId,
      rol: rol as "solicitante" | "remitente" | "admin",
      id_base,
    });

    return { success: true, data: solicitud };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lista las solicitudes pendientes según el rol (CU-19).
 * Remitente ve las de su base, admin ve todas.
 */
export async function consultarSolicitudesPendientesAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "remitente" && rol !== "admin")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    let id_base: string | undefined;

    if (rol === "remitente") {
      const remitente = await prisma.remitente.findUnique({
        where: { id_remitente: userId },
        select: { id_remitente: true },
      });
      id_base = remitente?.id_remitente ?? undefined;
    }

    const solicitudes = await consultarSolicitudesPendientesUseCase.ejecutar({
      rol: rol as "remitente" | "admin",
      id_base,
    });

    return { success: true, data: solicitudes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}