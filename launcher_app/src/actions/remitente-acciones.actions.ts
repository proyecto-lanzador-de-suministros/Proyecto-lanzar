"use server";

import { auth } from "@clerk/nextjs/server";
import {
  usuarioRepository,
  listarCatalogoProductosUseCase,
  envioRepository,
} from "../container";

/**
 * Consulta el detalle de una solicitud para remitente, con historial de estados (CU-20).
 * Valida que la solicitud corresponda a su base asignada.
 * Enriquece con nombres de solicitante y productos.
 */
export async function consultarDetalleSolicitudRemitenteAction(
  solicitudId: string,
) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "remitente") {
    return {
      success: false,
      error: "No autorizado. Se requiere rol remitente.",
    };
  }

  try {
    const { consultarDetalleSolicitudUseCase } = await import("../container");
    const { solicitud, historial } =
      await consultarDetalleSolicitudUseCase.ejecutar(solicitudId);

    // Verificar que el remitente puede ver esta solicitud
    const usuario = await usuarioRepository.buscarPorId(userId);
    if (!usuario) {
      return { success: false, error: "Usuario no encontrado." };
    }
    const idBase = usuario?.rol === "REMITENTE" ? usuario.idBase : undefined;
    if (solicitud.id_base !== idBase) {
      return {
        success: false,
        error: "No tenés permiso para consultar esta solicitud.",
      };
    }

    // Obtener datos del envío y trayectoria
    const envio = await envioRepository.buscarPorIdSolicitud(solicitudId);

    // Enriquecer: nombre del solicitante
    const solicitante = await usuarioRepository.buscarPorId(solicitud.id_usuario);
    // Enriquecer: nombres de productos
    const allProductoIds = [...new Set(solicitud.productos.map((p) => p.productoId))];
    const productMap = new Map<string, { nombre: string }>();
    if (allProductoIds.length > 0) {
      const catalogo = await listarCatalogoProductosUseCase.ejecutarCatalogo();
      catalogo.forEach((p) => {
        if (p.id_producto) {
          productMap.set(p.id_producto, { nombre: p.nombre });
        }
      });
    }

    return {
      success: true,
      data: {
        id: solicitud.id_solicitud,
        solicitanteId: solicitud.id_usuario,
        solicitanteNombre: solicitante?.nombre || "Desconocido",
        solicitanteEmail: solicitante?.email,
        baseId: solicitud.id_base,
        ubicacion_destino: solicitud.ubicacion_destino,
        prioridad: solicitud.prioridad,
        productos: solicitud.productos.map((p) => ({
          productoId: p.productoId,
          nombre: productMap.get(p.productoId)?.nombre || p.productoId,
          cantidad: p.cantidad,
        })),
        estado: solicitud.estado,
        motivoCancelacion: solicitud.motivoCancelacion,
        motivoAnulacion: solicitud.motivoAnulacion,
        fechaSolicitada: solicitud.fecha_solicitada.toISOString(),
        fechaActualizacion: solicitud.fechaActualizacion.toISOString(),
        fechaEntrega: solicitud.fecha_entrega
          ? solicitud.fecha_entrega.toISOString()
          : undefined,
        historial: historial.map((h) => ({
          id: h.id,
          actorId: h.actorId,
          estadoAnterior: h.estadoAnterior,
          estadoNuevo: h.estadoNuevo,
          fechaHora: h.fechaHora.toISOString(),
        })),
        trayectoria: envio?.datos_trayectoria ?? null,
      },
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

/**
 * Devuelve el id_base del remitente autenticado.
 * Útil para StockCard y otros componentes que necesiten saber la base.
 */
export async function obtenerMiBaseAction() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autenticado." };
  }

  try {
    const usuario = await usuarioRepository.buscarPorId(userId);
    if (!usuario || usuario.rol !== "REMITENTE") {
      return { success: false, error: "No sos un remitente." };
    }
    return { success: true, data: { id_base: usuario.idBase } };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}
