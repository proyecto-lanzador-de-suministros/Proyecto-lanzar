"use server";

import { auth } from "@clerk/nextjs/server";
import {
  consultarStockUseCase,
  actualizarStockUseCase,
  listarCatalogoProductosUseCase,
  listarHistorialStockUseCase,
  usuarioRepository,
} from "../container";
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

  const existe = await usuarioRepository.baseExiste(id_base);
  if (!existe) {
    return { success: false, error: "La base especificada no existe." };
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

  const existe = await usuarioRepository.baseExiste(id_base);
  if (!existe) {
    return { success: false, error: "La base especificada no existe." };
  }

  try {
    const resultado = await actualizarStockUseCase.ejecutar({
      id_base,
      productoId,
      modo,
      valor,
      actorId: userId,
    });
    return { success: true, data: resultado };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * CU-18 (postcondición): historial de quién cambió el stock, cuándo y
 * con qué valores. Mismas reglas de autorización que consultar/actualizar.
 */
export async function listarHistorialStockAction(id_base: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId) {
    return { success: false, error: "No autenticado." };
  }
  if (rol === "remitente" && userId !== id_base) {
    return { success: false, error: "Solo podés consultar el historial de tu propia base." };
  }
  if (rol !== "admin" && rol !== "remitente") {
    return { success: false, error: "No autorizado." };
  }

  const existe = await usuarioRepository.baseExiste(id_base);
  if (!existe) {
    return { success: false, error: "La base especificada no existe." };
  }

  try {
    const data = await listarHistorialStockUseCase.ejecutar(id_base);
    return {
      success: true,
      data: data.map((h) => ({
        id: h.id,
        nombreProducto: h.nombreProducto,
        cantidadAnterior: h.cantidadAnterior,
        cantidadNueva: h.cantidadNueva,
        actorNombre: h.actorNombre,
        fechaHora: h.fechaHora.toISOString(),
      })),
    };
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