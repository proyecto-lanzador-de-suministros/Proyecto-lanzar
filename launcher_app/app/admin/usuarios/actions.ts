"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { aprobarCuentaUseCase } from "@/src/container";

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
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuario sin nombre";
  const email = user.emailAddresses[0]?.emailAddress || "sin-email";

  // 1. Crear el registro base del usuario y el perfil por rol en Postgres
  //    (esto es infraestructura específica de Clerk que el dominio no puede hacer)
  await prisma.$transaction(async (tx) => {
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