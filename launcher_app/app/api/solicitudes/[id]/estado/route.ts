import { NextResponse } from "next/server";
import { solicitudesRepo } from "@/src/container";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nuevoEstado } = body;

    if (!nuevoEstado) return NextResponse.json({ error: "nuevoEstado es requerido" }, { status: 400 });

    // Usamos las funciones nativas del puerto de tu equipo
    const solicitud = await solicitudesRepo.buscarPorId(id);
    if (!solicitud) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    
    solicitud.estado = nuevoEstado;
    await solicitudesRepo.guardar(solicitud);

    return NextResponse.json(solicitud);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}