"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { completarRegistroUseCase } from "@/src/container";

export async function completarRegistroAction(datos: {
  rol: "SOLICITANTE" | "REMITENTE";
  nombre: string;
  nombreBase?: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { success: false, error: "No autenticado." };
  }

  if (datos.nombre.trim() === "") {
    return { success: false, error: "El nombre no puede estar vacío." };
  }

  try {
    await completarRegistroUseCase.ejecutar({
      usuarioId: userId,
      email: sessionClaims?.email ?? "",
      rol: datos.rol,
      nombre: datos.nombre,
      datosBase: datos.rol === "REMITENTE"
        ? {
            nombre: datos.nombreBase ?? `Base Logística ${datos.nombre}`,
            posicionBase: JSON.stringify({
              lat: datos.latitud ?? 0,
              lng: datos.longitud ?? 0,
            }),
            direccion: datos.direccion ?? "",
          }
        : undefined,
    });
  } catch (error: any) {
    return { success: false, error: error.message ?? "No se pudo completar el registro." };
  }

  revalidatePath("/completar-registro");
  redirect("/api/auth/login");
}
