"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearCuentaUseCase } from "@/src/container";

export async function registrarseAction(datos: {
  email: string;
  password: string;
  nombre: string;
  rol: "SOLICITANTE" | "REMITENTE";
  nombreBase?: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
}) {
  if (!datos.email.includes("@")) {
    return { success: false, error: "Ingresá un email válido." };
  }

  if (datos.password.length < 8) {
    return { success: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (datos.nombre.trim() === "") {
    return { success: false, error: "El nombre no puede estar vacío." };
  }

  try {
    await crearCuentaUseCase.ejecutar({
      email: datos.email,
      password: datos.password,
      nombre: datos.nombre,
      rol: datos.rol,
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
    return { success: false, error: error.message ?? "No se pudo crear la cuenta." };
  }

  revalidatePath("/sign-up");
  redirect("/sign-in");
}
