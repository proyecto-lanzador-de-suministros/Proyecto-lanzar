import { NextRequest, NextResponse } from "next/server";
import { listarSolicitudesAdmin } from "../../../../src/container";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // Agregamos await aquí:
    const { sessionClaims } = await auth();

    // Seguridad: Valida el rol de admin en el token de Clerk
    if (sessionClaims?.metadata?.rol !== 'admin') {
      return NextResponse.json({ error: "Acceso denegado. Rol de administrador requerido." }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const estado = searchParams.get("estado") || undefined;

    const solicitudes = await listarSolicitudesAdmin.ejecutar(estado);

    return NextResponse.json(solicitudes, { status: 200 });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}