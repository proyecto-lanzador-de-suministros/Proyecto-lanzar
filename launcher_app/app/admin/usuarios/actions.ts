"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Importamos la instancia que ya tiene configurado el adaptador Neon
import { prisma } from "@/src/infrastructure/db/prisma.client";

export async function aprobarUsuario(userId: string, rol: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // 1. Sincronizar con PostgreSQL (usamos una transacción para consistencia estricta RNF16)
  await prisma.$transaction(async (tx) => {
    // Upsert: Insertamos el usuario (o lo actualizamos si por alguna razón ya existía)
    await tx.usuario.upsert({
      where: { id_usuario: userId },
      update: { email: user.emailAddresses[0]?.emailAddress || "sin-email" },
      create: {
        id_usuario: userId,
        email: user.emailAddresses[0]?.emailAddress || "sin-email",
      },
    });

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario sin nombre";

    // Insertamos en la tabla Remitente según tu Diagrama ER
    if (rol === "remitente") {
      await tx.remitente.upsert({
        where: { id_remitente: userId },
        update: {}, // Si ya existe, no sobreescribimos su capacidad_pista o coordenadas
        create: {
          id_remitente: userId,
          nombre_base: `Base Logística ${fullName}`,
        },
      });
    } else if (rol === "solicitante") {
      await tx.solicitante.upsert({
        where: { id_solicitante: userId },
        update: {},
        create: {
          id_solicitante: userId,
          nombre: fullName,
        },
      });
    } else if (rol === "administrador" || rol === "admin") {
      await tx.administrador.upsert({
        where: { id_admin: userId },
        update: {},
        create: {
          id_admin: userId,
          nombre: fullName,
        },
      });
    }
  });

  // 2. Actualizar el metadato en Clerk para que la sesión del usuario lo reconozca como habilitado
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      status: "aprobada",
    },
  });

  // 3. Refrescar automáticamente la interfaz del administrador
  revalidatePath("/admin/usuarios");
}