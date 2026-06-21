"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { aprobarCuentaUseCase, crearCuentaUseCase } from "@/src/container";
import type { Prisma } from "../../../src/generated/prisma";

async function verificarAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.rol !== "admin") {
    return { ok: false as const, error: "No autorizado. Se requiere rol admin." };
  }
  return { ok: true as const };
}

/**
 * Aprueba una cuenta de usuario (CU-02).
 *
 * Esta action maneja únicamente lo que no puede hacer el caso de uso del dominio:
 * crear el perfil específico por rol en Postgres (Remitente, Solicitante, Administrador),
 * que requiere datos de Clerk (nombre, email) que el dominio no conoce.
 *
 * La actualización de estado en Postgres y la sincronización con Clerk
 * la delega al caso de uso AprobarCuentaUseCase.
 */
export async function aprobarUsuario(userId: string, rol: string) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) throw new Error(chequeo.error);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario sin nombre";
  const email = user.emailAddresses[0]?.emailAddress || "sin-email";

  // 1. Crear el registro base del usuario y el perfil por rol en Postgres
  //    (esto es infraestructura específica de Clerk que el dominio no puede hacer)
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.usuario.upsert({
      where: { id_usuario: userId },
      update: {},
      create: { id_usuario: userId },//saque el email para que funcione el build
    });

    if (rol === "remitente") {
      await tx.remitente.upsert({
        where: { id_remitente: userId },
        update: {},
        create: {
          id_remitente: userId,
          nombre_base: `Base Logística ${fullName}`,
          latitud_base: 0,
          longitud_base: 0,
          capacidad_pista: "pendiente",
        },
      });
    } else if (rol === "solicitante") {
      await tx.solicitante.upsert({
        where: { id_solicitante: userId },
        update: {},
        create: { id_solicitante: userId, nombre: fullName, contacto: email },
      });
    } else if (rol === "administrador" || rol === "admin") {
      await tx.administrador.upsert({
        where: { id_admin: userId },
        update: {},
        create: {
          id_admin: userId,
          nombre: fullName,
          usuario: email,
          permisos_rol: "admin",
        },
      });
    }
  });

  // 2. Aprobar en dominio + sincronizar con Clerk (delegado al caso de uso)
  await aprobarCuentaUseCase.ejecutar(userId);

  revalidatePath("/admin/usuarios");
}

/**
 * CU-04: Obtiene los datos editables de una cuenta para precargar el
 * formulario de edición del admin (datos específicos por rol + email
 * de login desde Clerk). Solo lectura.
 */
export async function obtenerDetalleCuentaAction(usuarioId: string, rolNormalizado: string) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  const client = await clerkClient();

  try {
    const clerkUser = await client.users.getUser(usuarioId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    let datos: Record<string, unknown> = {};

    if (rolNormalizado === "solicitante") {
      const solicitante = await prisma.solicitante.findUnique({
        where: { id_solicitante: usuarioId },
        select: { nombre: true, contacto: true },
      });
      datos = { nombre: solicitante?.nombre ?? "", contacto: solicitante?.contacto ?? "" };
    } else if (rolNormalizado === "administrador" || rolNormalizado === "admin") {
      const administrador = await prisma.administrador.findUnique({
        where: { id_admin: usuarioId },
        select: { nombre: true, permisos_rol: true },
      });
      datos = { nombre: administrador?.nombre ?? "", permisos_rol: administrador?.permisos_rol ?? "" };
    } else if (rolNormalizado === "remitente") {
      const remitente = await prisma.remitente.findUnique({
        where: { id_remitente: usuarioId },
        select: { nombre_base: true, capacidad_pista: true, latitud_base: true, longitud_base: true },
      });
      datos = remitente ?? {};
    }

    return { success: true, data: { email, ...datos } };
  } catch (error: any) {
    return { success: false, error: error.message ?? "No se pudo cargar la cuenta." };
  }
}

/**
 * CU-04: Edita la información de cuenta (no relacionada al login) de un
 * Solicitante o Administrador. Los datos físicos de una base Remitente
 * (nombre de base, ubicación, capacidad de pista) se editan exclusivamente
 * desde "Gestión de Remitentes" para no duplicar la fuente de verdad.
 */
export async function editarInfoCuentaAction(
  usuarioId: string,
  rolNormalizado: string,
  datos: { nombre?: string; contacto?: string; permisos_rol?: string },
) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  if (datos.nombre !== undefined && datos.nombre.trim() === "") {
    return { success: false, error: "El nombre no puede estar vacío." };
  }

  try {
    if (rolNormalizado === "solicitante") {
      await prisma.solicitante.update({
        where: { id_solicitante: usuarioId },
        data: {
          ...(datos.nombre !== undefined && { nombre: datos.nombre }),
          ...(datos.contacto !== undefined && { contacto: datos.contacto }),
        },
      });
    } else if (rolNormalizado === "administrador" || rolNormalizado === "admin") {
      await prisma.administrador.update({
        where: { id_admin: usuarioId },
        data: {
          ...(datos.nombre !== undefined && { nombre: datos.nombre }),
          ...(datos.permisos_rol !== undefined && { permisos_rol: datos.permisos_rol }),
        },
      });
    } else {
      return {
        success: false,
        error: "Para editar los datos de una base remitente, usá la sección 'Remitentes'.",
      };
    }

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * CU-03 (contraseña): el admin fija directamente una nueva contraseña
 * para cualquier cuenta, sin pasar por el flujo de "olvidé mi contraseña".
 */
export async function resetearPasswordAction(usuarioId: string, nuevaPassword: string) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  if (nuevaPassword.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUser(usuarioId, { password: nuevaPassword });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message ?? "No se pudo actualizar la contraseña." };
  }
}

/**
 * CU-03 (email): el admin cambia el email de acceso de cualquier cuenta.
 * Verificado contra la documentación de Clerk: emailAddresses.createEmailAddress
 * es un wrapper estable de POST /email_addresses del Backend API.
 */
export async function actualizarEmailLoginAction(usuarioId: string, nuevoEmail: string) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  if (!nuevoEmail.includes("@")) {
    return { success: false, error: "Ingresá un email válido." };
  }

  try {
    const client = await clerkClient();
    await client.emailAddresses.createEmailAddress({
      userId: usuarioId,
      emailAddress: nuevoEmail,
      verified: true,
      primary: true,
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message ?? "No se pudo actualizar el email.",
    };
  }
}

/**
 * Alta directa de cuenta por parte del admin (CU-01, variante administrativa).
 *
 * A diferencia de aprobarUsuario (que aprueba una cuenta que ya se
 * autoregistró desde /sign-up), acá el admin crea la cuenta de punta a
 * punta: la persona nunca pasa por el flujo de registro. El alta tiene
 * dos partes:
 *
 * 1. crearCuentaUseCase (dominio): valida los datos y crea el usuario
 *    en Clerk con el rol ya seteado en publicMetadata.
 * 2. Esta action (infraestructura específica de Clerk + Postgres):
 *    crea el registro base Usuario y el perfil por rol, ya en estado
 *    APROBADA — no tiene sentido pedirle al admin que apruebe una
 *    cuenta que él mismo acaba de dar de alta.
 *
 * Replica el mismo patrón transaccional que aprobarUsuario, para no
 * introducir una segunda forma de crear perfiles por rol en el sistema.
 * Si falla la creación en Postgres después de haber creado el usuario
 * en Clerk, el usuario queda huérfano en Clerk (sin perfil local) —
 * mismo riesgo que ya existe en el flujo de self-signup, no es una
 * regresión introducida acá.
 */
export async function crearUsuarioAction(datos: {
  email: string;
  password: string;
  nombre: string;
  rol: "admin" | "remitente" | "solicitante";
}) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  try {
    // 1. Crear en Clerk (dominio)
    const { id: userId } = await crearCuentaUseCase.ejecutar(datos);

    // 2. Crear registro base + perfil por rol en Postgres, ya APROBADA
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usuario.create({
        data: {
          id_usuario: userId,
          estado_cuenta: "APROBADA",
        },
      });

      if (datos.rol === "remitente") {
        await tx.remitente.create({
          data: {
            id_remitente: userId,
            nombre_base: `Base Logística ${datos.nombre}`,
            latitud_base: 0,
            longitud_base: 0,
            capacidad_pista: "pendiente",
          },
        });
      } else if (datos.rol === "solicitante") {
        await tx.solicitante.create({
          data: { id_solicitante: userId, nombre: datos.nombre, contacto: datos.email },
        });
      } else if (datos.rol === "admin") {
        await tx.administrador.create({
          data: {
            id_admin: userId,
            nombre: datos.nombre,
            usuario: datos.email,
            permisos_rol: "admin",
          },
        });
      }
    });

    revalidatePath("/admin/usuarios");
    return { success: true, data: { id: userId } };
  } catch (error: any) {
    return { success: false, error: error.message ?? "No se pudo crear el usuario." };
  }
}