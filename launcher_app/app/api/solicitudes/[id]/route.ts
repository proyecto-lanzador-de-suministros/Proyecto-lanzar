import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { consultarSolicitudUseCase } from "@/src/container";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

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
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json(
      { error: { code, message } },
      { status: httpStatus }
    );
  }
}