"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/db/prisma.client";

/**
 * Lista todas las bases remitentes registradas, con su estado de cuenta
 * y un flag de "configuración pendiente" si lat/long siguen en 0,0
 * (valor por defecto al aprobar la cuenta — ver app/admin/usuarios/actions.ts,
 * que no tiene de dónde sacar coordenadas reales al momento de aprobar).
 */
export async function listarRemitentesAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const remitentes = await prisma.remitente.findMany({
      include: { usuario: { select: { estado_cuenta: true } } },
      orderBy: { nombre_base: "asc" },
    });

    const data = remitentes.map((r) => ({
      id_remitente: r.id_remitente,
      nombre_base: r.nombre_base,
      latitud_base: r.latitud_base,
      longitud_base: r.longitud_base,
      capacidad_pista: r.capacidad_pista,
      estado_cuenta: r.usuario.estado_cuenta,
      configuracionPendiente: r.latitud_base === 0 && r.longitud_base === 0,
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza los datos físicos de una base remitente (nombre, ubicación,
 * capacidad de pista). Es la corrección manual al hueco que deja CU-02:
 * Clerk no provee coordenadas ni capacidad de pista al aprobar la cuenta,
 * así que el admin tiene que completarlas acá.
 */
export async function actualizarBaseRemitenteAction(
  id_remitente: string,
  datos: {
    nombre_base?: string;
    latitud_base?: number;
    longitud_base?: number;
    capacidad_pista?: string;
  },
) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  if (
    datos.latitud_base !== undefined &&
    (!Number.isFinite(datos.latitud_base) || datos.latitud_base < -90 || datos.latitud_base > 90)
  ) {
    return { success: false, error: "Latitud inválida. Debe estar entre -90 y 90." };
  }

  if (
    datos.longitud_base !== undefined &&
    (!Number.isFinite(datos.longitud_base) || datos.longitud_base < -180 || datos.longitud_base > 180)
  ) {
    return { success: false, error: "Longitud inválida. Debe estar entre -180 y 180." };
  }

  if (datos.nombre_base !== undefined && datos.nombre_base.trim() === "") {
    return { success: false, error: "El nombre de la base no puede estar vacío." };
  }

  if (datos.capacidad_pista !== undefined && datos.capacidad_pista.trim() === "") {
    return { success: false, error: "La capacidad de pista no puede estar vacía." };
  }

  try {
    await prisma.remitente.update({
      where: { id_remitente },
      data: {
        ...(datos.nombre_base !== undefined && { nombre_base: datos.nombre_base }),
        ...(datos.latitud_base !== undefined && { latitud_base: datos.latitud_base }),
        ...(datos.longitud_base !== undefined && { longitud_base: datos.longitud_base }),
        ...(datos.capacidad_pista !== undefined && { capacidad_pista: datos.capacidad_pista }),
      },
    });

    revalidatePath("/admin/remitentes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}