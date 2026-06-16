import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listarSolicitudesAdminUseCase } from "@/src/container";

export async function GET(request: Request) {
  // Verificar sesión y rol antes de cualquier operación
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.rol !== "admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Acceso denegado: se requiere rol admin." } },
      { status: 403 }
    );
  }

  // Filtro de estado opcional (?estado=Creada)
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") ?? undefined;

  try {
    const solicitudes = await listarSolicitudesAdminUseCase.ejecutar(estado);
    return NextResponse.json(solicitudes);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}