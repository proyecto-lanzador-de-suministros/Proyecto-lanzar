"use server";

import { auth } from "@clerk/nextjs/server";
import { generarReporteGeneralUseCase } from "../container";

export async function obtenerReporteSolicitudesAction(rango?: { desde?: string; hasta?: string }) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const reporte = await generarReporteGeneralUseCase.ejecutarSolicitudes(rango);
    return {
      success: true,
      data: reporte.filas,
      resumen: reporte.resumen,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function obtenerReporteStockAction() {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (!userId || rol !== "admin") {
    return { success: false, error: "No autorizado. Se requiere rol admin." };
  }

  try {
    const data = await generarReporteGeneralUseCase.ejecutarStock();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}