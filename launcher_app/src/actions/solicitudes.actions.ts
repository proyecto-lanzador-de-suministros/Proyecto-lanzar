"use server";

import { Errores } from "@/src/modules/errors/domain/factories";
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
  solicitudRepository,
  inicializarDatosPruebaUseCase,
  listarCatalogoProductosUseCase,
  usuarioRepository,
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

    revalidatePath("/admin/dashboard");
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

    revalidatePath("/admin/dashboard");
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

    revalidatePath("/admin/dashboard");
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

    revalidatePath("/admin/dashboard");
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

    revalidatePath("/admin/dashboard");
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
    if (!remitenteId) throw Errores.remitenteNoSeleccionado();

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
    await inicializarDatosPruebaUseCase.ejecutar(userId);

    // Mapear los productos para resolver IDs reales por nombre/UUID
    const mappedProductos = [];
    for (const p of data.productos) {
      const dbProduct = await listarCatalogoProductosUseCase.ejecutarBuscarProducto(p.productoId);
      if (!dbProduct) {
        throw Errores.productoNoEncontrado(p.productoId);
      }
      mappedProductos.push({
        productoId: dbProduct.id_producto,
        cantidad: p.cantidad,
      });
    }

    const resultado = await crearSolicitudUseCase.ejecutar({
      id_usuario: userId,
      ubicacion_destino: data.ubicacion_destino,
      prioridad: data.prioridad,
      productos: mappedProductos,
      fecha_estimada: data.fecha_estimada,
    });

    revalidatePath("/solicitante/solicitudes");
    return {
      success: true,
      data: {
        id: resultado.solicitud.id_solicitud,
        estado: resultado.solicitud.estado,
        asignada: resultado.asignada,
        stockFaltante: resultado.stockFaltante,
      },
    };
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
      const usuario = await usuarioRepository.buscarPorId(userId);
      id_base = usuario?.rol === "REMITENTE" ? usuario.id : undefined;
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
      const usuario = await usuarioRepository.buscarPorId(userId);
      id_base = usuario?.rol === "REMITENTE" ? usuario.id : undefined;
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

/**
 * Lista todas las solicitudes del solicitante autenticado.
 */
export async function obtenerSolicitudesSolicitanteAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "solicitante") {
    return { success: false, error: "No autorizado. Se requiere rol solicitante." };
  }

  try {
    await inicializarDatosPruebaUseCase.ejecutar(userId);

    const solicitudesDomain = await solicitudRepository.listarPorSolicitante(userId);
    const data = solicitudesDomain.map((s) => ({
      id: s.id_solicitud,
      id_usuario: s.id_usuario,
      id_base: s.id_base,
      ubicacion_destino: s.ubicacion_destino,
      prioridad: s.prioridad,
      productos: s.productos,
      estado: s.estado,
      fecha_solicitada: s.fecha_solicitada.toISOString(),
      fecha_estimada: s.fecha_estimada ? s.fecha_estimada.toISOString() : undefined,
      fecha_entrega: s.fecha_entrega ? s.fecha_entrega.toISOString() : undefined,
      motivoCancelacion: s.motivoCancelacion,
      motivoAnulacion: s.motivoAnulacion,
      fechaActualizacion: s.fechaActualizacion.toISOString(),
      puedeSerCancelada: s.puedeSerCancelada(),
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lista todos los productos disponibles en el catálogo.
 */
export async function obtenerProductosAction() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "No autenticado." };

  try {
    const { listarCatalogoProductosUseCase } = await import("../container");
    const catalogo = await listarCatalogoProductosUseCase.ejecutarCatalogo();
    return { success: true, data: catalogo };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
/**
 * Consulta el detalle completo de una solicitud para el panel admin,
 * incluyendo el historial de cambios de estado (CU-20).
 * Solo accesible por admin.
 */
export async function consultarDetalleSolicitudAdminAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const { consultarDetalleSolicitudUseCase } = await import("../container");
    const { solicitud, historial } = await consultarDetalleSolicitudUseCase.ejecutar(solicitudId);

    return {
      success: true,
      data: {
        id: solicitud.id_solicitud,
        solicitanteId: solicitud.id_usuario,
        remitenteId: solicitud.id_base,
        ubicacion_destino: solicitud.ubicacion_destino,
        prioridad: solicitud.prioridad,
        productos: solicitud.productos,
        estado: solicitud.estado,
        motivoCancelacion: solicitud.motivoCancelacion,
        motivoAnulacion: solicitud.motivoAnulacion,
        fechaSolicitada: solicitud.fecha_solicitada.toISOString(),
        fechaActualizacion: solicitud.fechaActualizacion.toISOString(),
        fechaEntrega: solicitud.fecha_entrega ? solicitud.fecha_entrega.toISOString() : undefined,
        historial: historial.map((h) => ({
          id: h.id,
          actorId: h.actorId,
          estadoAnterior: h.estadoAnterior,
          estadoNuevo: h.estadoNuevo,
          fechaHora: h.fechaHora.toISOString(),
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Consulta el detalle de una solicitud propia con su historial de estados (CU-20).
 * Reutiliza el mismo use case que admin, pero valida que la solicitud
 * le pertenezca al solicitante autenticado.
 */
export async function consultarDetalleSolicitudSolicitanteAction(solicitudId: string) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "solicitante") {
    return { success: false, error: "No autorizado. Se requiere rol solicitante." };
  }

  try {
    const { consultarDetalleSolicitudUseCase } = await import("../container");
    const { solicitud, historial } = await consultarDetalleSolicitudUseCase.ejecutar(solicitudId);
    // Verificar pertenencia: el solicitante solo puede ver sus propias solicitudes
    if (solicitud.id_usuario !== userId) {
      return { success: false, error: "No tenés permiso para consultar esta solicitud." };
    }

    return {
      success: true,
      data: {
        id: solicitud.id_solicitud,
        ubicacion_destino: solicitud.ubicacion_destino,
        prioridad: solicitud.prioridad,
        productos: solicitud.productos,
        estado: solicitud.estado,
        motivoCancelacion: solicitud.motivoCancelacion,
        motivoAnulacion: solicitud.motivoAnulacion,
        fechaSolicitada: solicitud.fecha_solicitada.toISOString(),
        fechaActualizacion: solicitud.fechaActualizacion.toISOString(),
        fechaEntrega: solicitud.fecha_entrega ? solicitud.fecha_entrega.toISOString() : undefined,
        puedeSerCancelada: solicitud.puedeSerCancelada(),
        historial: historial.map((h) => ({
          id: h.id,
          actorId: h.actorId,
          estadoAnterior: h.estadoAnterior,
          estadoNuevo: h.estadoNuevo,
          fechaHora: h.fechaHora.toISOString(),
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}