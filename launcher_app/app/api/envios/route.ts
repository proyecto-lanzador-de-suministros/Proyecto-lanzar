import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listarEnviosUseCase, programarEnvioUseCase } from "@/src/container";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "No autenticado." } }, { status: 401 });

  try {
    const envios = await listarEnviosUseCase.ejecutar();
    const response = envios.map((e) => ({
      id: e.id_envio,
      fechaHoraProgramada: e.fecha_hora_programada?.toISOString() ?? null,
      estado: e.estado_envio,
    }));
    return NextResponse.json(response);
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;
  if (!userId || (rol !== "admin" && rol !== "remitente")) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Acceso denegado." } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id_solicitud, id_base, matricula_avion, piloto } = body;

    if (!id_solicitud || !id_base) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "id_solicitud y id_base son requeridos." } },
        { status: 400 },
      );
    }

    const envio = await programarEnvioUseCase.ejecutar({
      id_solicitud,
      id_base,
      matricula_avion,
      piloto,
    });

    return NextResponse.json(
      {
        id: envio.id_envio,
        fechaHoraProgramada: envio.fecha_hora_programada?.toISOString() ?? null,
        estado: envio.estado_envio,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}
