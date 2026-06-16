import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { solicitudRepository } from "@/src/container";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Solo admin o remitente pueden cambiar el estado de una solicitud
  const { sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;

  if (rol !== "admin" && rol !== "remitente") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Acceso denegado." } },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { nuevoEstado } = body as { nuevoEstado: EstadoSolicitud };

    if (!nuevoEstado) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "nuevoEstado es requerido." } },
        { status: 400 }
      );
    }

    const solicitud = await solicitudRepository.buscarPorId(id);
    if (!solicitud) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Solicitud no encontrada." } },
        { status: 404 }
      );
    }

    // avanzarEstado valida la máquina de estados del dominio y lanza si la transición es inválida
    solicitud.avanzarEstado(nuevoEstado);
    await solicitudRepository.guardar(solicitud);

    return NextResponse.json({ id: solicitud.id, estado: solicitud.estado });
  } catch (error: any) {
    // Distinguir errores de dominio (transición inválida) de errores inesperados
    const isDomaineError = error.message?.includes("Transición inválida");
    return NextResponse.json(
      { error: { code: isDomaineError ? "INVALID_TRANSITION" : "INTERNAL_ERROR", message: error.message } },
      { status: isDomaineError ? 422 : 500 }
    );
  }
}