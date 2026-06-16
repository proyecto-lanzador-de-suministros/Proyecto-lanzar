import { NextResponse } from "next/server";
import { listarSolicitudesAdmin } from "@/src/container";

export async function GET() {
  try {
    // Usamos el caso de uso que tu equipo ya dejó inyectado
    const solicitudes = await listarSolicitudesAdmin.ejecutar();
    return NextResponse.json(solicitudes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}