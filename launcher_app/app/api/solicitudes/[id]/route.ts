// Route handler de Next.js. Actúa como driver adapter HTTP para GET /api/solicitudes/:id.
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { consultarSolicitudUseCase } from "@/src/container";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "No autenticado." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const rol = sessionClaims?.metadata?.rol as "solicitante" | "remitente" | "admin";

    const solicitud = await consultarSolicitudUseCase.ejecutar({
      id_solicitud: id,
      id_usuario: userId,
      rol,
    });

    return NextResponse.json(solicitud);
  } catch (error: any) {
    const isNotFound = error.message?.includes("no encontrada");
    const isForbidden = error.message?.includes("permiso");
    return NextResponse.json(
      { error: { code: isNotFound ? "NOT_FOUND" : isForbidden ? "FORBIDDEN" : "INTERNAL_ERROR", message: error.message } },
      { status: isNotFound ? 404 : isForbidden ? 403 : 500 }
    );
  }
}