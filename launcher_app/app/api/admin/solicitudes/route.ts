import { NextResponse } from "next/server";
import { listarSolicitudesAdminUseCase } from "@/src/container";

export async function GET() {
  try {
    // Usamos el caso de uso que tu equipo ya dejó inyectado
    const solicitudes = await listarSolicitudesAdminUseCase.ejecutar();
    return NextResponse.json(solicitudes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}