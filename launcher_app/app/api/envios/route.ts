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
    const { id_solicitud, id_base, altitud_liberacion_m } = body;

    if (!id_solicitud || !id_base) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "id_solicitud y id_base son requeridos." } },
        { status: 400 },
      );
    }

    if (!altitud_liberacion_m || typeof altitud_liberacion_m !== "number" || altitud_liberacion_m <= 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "altitud_liberacion_m debe ser un número positivo." } },
        { status: 400 },
      );
    }

    const resultado = await programarEnvioUseCase.ejecutar({
      id_solicitud,
      id_base,
      altitud_liberacion_m,
    });

    return NextResponse.json(
      {
        id: resultado.envio.id_envio,
        fechaHoraProgramada: resultado.envio.fecha_hora_programada?.toISOString() ?? null,
        estado: resultado.envio.estado_envio,
        trayectoria: {
          punto_lanzamiento: resultado.trayectoria.punto_lanzamiento,
          offset_norte_m: resultado.trayectoria.offset_norte_m,
          offset_este_m: resultado.trayectoria.offset_este_m,
          timestamp_estimado: resultado.trayectoria.timestamp_estimado.toISOString(),
          condiciones_seguras: resultado.trayectoria.condiciones_seguras,
          altitud_liberacion_m: resultado.trayectoria.altitud_liberacion_m,
          peso_total_kg: resultado.trayectoria.peso_total_kg,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}
