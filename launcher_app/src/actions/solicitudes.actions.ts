"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
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
    // Asegurar que el solicitante y la data de prueba existan en base de datos
    await ensureSolicitanteExists(userId);
    await ensureTestDataSeeded();

    // Mapear los productos para resolver IDs reales por nombre/UUID
    const mappedProductos = [];
    for (const p of data.productos) {
      const dbProduct = await prisma.producto.findFirst({
        where: {
          OR: [
            { id_producto: p.productoId },
            { nombre: p.productoId },
          ],
        },
      });
      if (!dbProduct) {
        throw new Error(`Producto no encontrado en catálogo: ${p.productoId}`);
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
    // Asegurar que el solicitante y la data básica de prueba existan en base de datos
    await ensureSolicitanteExists(userId);
    await ensureTestDataSeeded();

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

async function ensureSolicitanteExists(userId: string) {
  const existing = await prisma.solicitante.findUnique({
    where: { id_solicitante: userId },
  });
  if (existing) return;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "solicitante@correo.com";
  const nombre = clerkUser?.fullName ?? "Usuario Solicitante";

  await prisma.$transaction(async (tx) => {
    let usuario = await tx.usuario.findUnique({
      where: { id_usuario: userId },
    });
    if (!usuario) {
      usuario = await tx.usuario.create({
        data: {
          id_usuario: userId,
          estado_cuenta: "APROBADA",
        },
      });
    }

    await tx.solicitante.create({
      data: {
        id_solicitante: userId,
        nombre,
        contacto: email,
      },
    });
  });
}

async function ensureTestDataSeeded() {
  const baseCount = await prisma.remitente.count();
  const productCount = await prisma.producto.count();

  let defaultBaseId = "";

  if (baseCount === 0) {
    const baseUserId = "base-default-id";
    await prisma.$transaction(async (tx) => {
      await tx.usuario.upsert({
        where: { id_usuario: baseUserId },
        update: {},
        create: {
          id_usuario: baseUserId,
          estado_cuenta: "APROBADA",
        },
      });

      const base = await tx.remitente.upsert({
        where: { id_remitente: baseUserId },
        update: {},
        create: {
          id_remitente: baseUserId,
          nombre_base: "Base Central Bahía Blanca",
          latitud_base: -38.7183,
          longitud_base: -62.2663,
          capacidad_pista: "Grande",
        },
      });
      defaultBaseId = base.id_remitente;
    });
  } else {
    const base = await prisma.remitente.findFirst();
    defaultBaseId = base!.id_remitente;
  }

  if (productCount === 0) {
    await prisma.$transaction(async (tx) => {
      const tipo = await tx.tipo.create({
        data: {
          nombre_categoria: "Suministros Médicos",
          peso_prioridad: 1,
        },
      });

      const prod1 = await tx.producto.create({
        data: {
          nombre: "Vacunas y Suero Fisiológico",
          descripcion: "Kit térmico con vacunas esenciales y suero.",
          peso_unitario: 4.5,
          id_tipo: tipo.id_tipo,
        },
      });

      const prod2 = await tx.producto.create({
        data: {
          nombre: "Botiquín de Primeros Auxilios",
          descripcion: "Gasas, desinfectante, bandages y medicamentos básicos.",
          peso_unitario: 1.5,
          id_tipo: tipo.id_tipo,
        },
      });

      const prod3 = await tx.producto.create({
        data: {
          nombre: "Raciones de Alimento Deshidratado",
          descripcion: "Comida de emergencia alta en calorías.",
          peso_unitario: 2.0,
          id_tipo: tipo.id_tipo,
        },
      });

      await tx.stock_Base.createMany({
        data: [
          { id_remitente: defaultBaseId, id_producto: prod1.id_producto, cantidad_disponible: 100 },
          { id_remitente: defaultBaseId, id_producto: prod2.id_producto, cantidad_disponible: 150 },
          { id_remitente: defaultBaseId, id_producto: prod3.id_producto, cantidad_disponible: 200 },
        ],
      });
    });
  }
}

/**
 * Lista todos los productos disponibles en el catálogo.
 */
export async function obtenerProductosAction() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "No autenticado." };

  try {
    const productos = await prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id_producto: true,
        nombre: true,
        descripcion: true,
        peso_unitario: true,
      },
    });
    return { success: true, data: productos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}