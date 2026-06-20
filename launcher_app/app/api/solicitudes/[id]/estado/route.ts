import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { solicitudRepository } from "@/src/container";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    solicitud.avanzarEstado(nuevoEstado);
    await solicitudRepository.actualizarEstado(id, solicitud.estado);

    return NextResponse.json({ id: solicitud.id_solicitud, estado: solicitud.estado });
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json(
      { error: { code, message } },
      { status: httpStatus }
    );
  }
}