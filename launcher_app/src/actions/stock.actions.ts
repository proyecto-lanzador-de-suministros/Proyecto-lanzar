"use server";

import { auth } from "@clerk/nextjs/server";
import { consultarStockUseCase, actualizarStockUseCase, listarCatalogoProductosUseCase } from "../container";

/**
 * Consulta el stock de una base específica (CU-17).
 * Admin puede consultar cualquier base; remitente solo la propia
 * (se valida comparando id_base con el userId autenticado).
 */
export async function consultarStockBaseAction(id_base: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId) {
    return { success: false, error: "No autenticado." };
  }

  if (rol === "remitente" && userId !== id_base) {
    return { success: false, error: "Solo podés consultar tu propio stock." };
  }

  if (rol !== "admin" && rol !== "remitente") {
    return { success: false, error: "No autorizado." };
  }

  try {
    const stock = await consultarStockUseCase.ejecutar(id_base);
    return { success: true, data: stock };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza la cantidad de stock de un producto en una base (CU-18).
 * Admin puede actualizar cualquier base; remitente solo la propia.
 *
 * @param modo "absoluto" reemplaza el valor; "delta" suma/resta sobre el actual.
 */
export async function actualizarStockAction(
  id_base: string,
  productoId: string,
  modo: "absoluto" | "delta",
  valor: number,
) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId) {
    return { success: false, error: "No autenticado." };
  }

  if (rol === "remitente" && userId !== id_base) {
    return { success: false, error: "Solo podés actualizar tu propio stock." };
  }

  if (rol !== "admin" && rol !== "remitente") {
    return { success: false, error: "No autorizado." };
  }

  try {
    const resultado = await actualizarStockUseCase.ejecutar({
      id_base,
      productoId,
      modo,
      valor,
    });
    return { success: true, data: resultado };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lista todos los remitentes (bases) aprobados, con su nombre,
 * para el selector de la vista de stock del admin.
 * Reutiliza la misma fuente que obtenerRemitentesAprobadosAction
 * en usuarios.actions.ts, pero vive acá para no crear dependencia
 * cruzada entre módulos de actions.
 */
export async function listarBasesParaStockAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const data = await listarCatalogoProductosUseCase.ejecutarBases();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listarCatalogoProductosAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || (rol !== "admin" && rol !== "remitente")) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const data = await listarCatalogoProductosUseCase.ejecutarCatalogo();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}