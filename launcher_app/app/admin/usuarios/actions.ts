"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { aprobarCuentaUseCase, crearCuentaUseCase } from "@/src/container";

async function verificarAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId || sessionClaims?.metadata?.rol !== "admin") {
    return { ok: false as const, error: "No autorizado. Se requiere rol admin." };
  }
  return { ok: true as const };
}

function rolNormalizar(rol: string): string {
  if (rol === "admin" || rol === "administrador") return "ADMINISTRADOR";
  if (rol === "remitente") return "REMITENTE";
  return "SOLICITANTE";
}

export async function aprobarUsuario(userId: string, rol: string) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) throw new Error(chequeo.error);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario sin nombre";
  const email = user.emailAddresses[0]?.emailAddress || "sin-email";
  const rolNorm = rolNormalizar(rol);

  await prisma.$transaction(async (tx) => {
    await tx.usuario.upsert({
      where: { id_usuario: userId },
      update: { rol: rolNorm, nombre: fullName },
      create: {
        id_usuario: userId,
        nombre: fullName,
        email,
        rol: rolNorm,
        estado_cuenta: "PENDIENTE",
      },
    });

    if (rolNorm === "REMITENTE") {
      const base = await tx.base.create({
        data: {
          nombre: `Base Logística ${fullName}`,
          posicion_base: JSON.stringify({ lat: 0, lng: 0 }),
          direccion: "",
        },
      });
      await tx.usuario.update({
        where: { id_usuario: userId },
        data: { id_base: base.id_base },
      });
    }
  });

  await aprobarCuentaUseCase.ejecutar(userId);
  revalidatePath("/admin/usuarios");
}

export async function obtenerDetalleCuentaAction(usuarioId: string, rolNormalizado: string) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  const client = await clerkClient();

  try {
    const clerkUser = await client.users.getUser(usuarioId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const rolNorm = rolNormalizar(rolNormalizado);

    let datos: Record<string, unknown> = {};

    if (rolNorm === "SOLICITANTE") {
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: usuarioId },
        select: { nombre: true, email: true },
      });
      datos = { nombre: usuario?.nombre ?? "", contacto: usuario?.email ?? "" };
    } else if (rolNorm === "ADMINISTRADOR") {
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: usuarioId },
        select: { nombre: true },
      });
      datos = { nombre: usuario?.nombre ?? "", permisos_rol: "admin" };
    } else if (rolNorm === "REMITENTE") {
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: usuarioId },
        include: { base: true },
      });
      const posicion = usuario?.base?.posicion_base
        ? JSON.parse(usuario.base.posicion_base) as { lat: number; lng: number }
        : { lat: 0, lng: 0 };
      datos = {
        nombre: usuario?.base?.nombre ?? "",
        latitud: posicion.lat,
        longitud: posicion.lng,
        capacidad_pista: "",
      };
    }

    return { success: true, data: { email, ...datos } };
  } catch (error: any) {
    return { success: false, error: error.message ?? "No se pudo cargar la cuenta." };
  }
}

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
    const rolNorm = rolNormalizar(rolNormalizado);

    if (rolNorm === "SOLICITANTE") {
      await prisma.usuario.update({
        where: { id_usuario: usuarioId },
        data: {
          ...(datos.nombre !== undefined && { nombre: datos.nombre }),
          ...(datos.contacto !== undefined && { email: datos.contacto }),
        },
      });
    } else if (rolNorm === "ADMINISTRADOR") {
      await prisma.usuario.update({
        where: { id_usuario: usuarioId },
        data: {
          ...(datos.nombre !== undefined && { nombre: datos.nombre }),
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

export async function crearUsuarioAction(datos: {
  email: string;
  password: string;
  nombre: string;
  rol: "admin" | "remitente" | "solicitante";
}) {
  const chequeo = await verificarAdmin();
  if (!chequeo.ok) return { success: false, error: chequeo.error };

  try {
    const { id: userId } = await crearCuentaUseCase.ejecutar(datos);
    const rolNorm = rolNormalizar(datos.rol);

    await prisma.$transaction(async (tx) => {
      await tx.usuario.create({
        data: {
          id_usuario: userId,
          nombre: datos.nombre,
          email: datos.email,
          rol: rolNorm,
          estado_cuenta: "APROBADA",
        },
      });

      if (rolNorm === "REMITENTE") {
        const base = await tx.base.create({
          data: {
            nombre: `Base Logística ${datos.nombre}`,
            posicion_base: JSON.stringify({ lat: 0, lng: 0 }),
            direccion: "",
          },
        });
        await tx.usuario.update({
          where: { id_usuario: userId },
          data: { id_base: base.id_base },
        });
      }
    });

    revalidatePath("/admin/usuarios");
    return { success: true, data: { id: userId } };
  } catch (error: any) {
    return { success: false, error: error.message ?? "No se pudo crear el usuario." };
  }
}
