import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { asignarContenedorUseCase } from "@/src/container";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, sessionClaims } = await auth();
  const rol = sessionClaims?.metadata?.rol;
  if (!userId || (rol !== "admin" && rol !== "remitente")) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Acceso denegado." } }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { tipoParacaidas, pesoMax } = body;

    if (!tipoParacaidas || !pesoMax) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "tipoParacaidas y pesoMax son requeridos." } },
        { status: 400 },
      );
    }

    const contenedor = await asignarContenedorUseCase.ejecutar({
      id_envio: id,
      tipo_paracaidas: tipoParacaidas,
      peso_maximo: pesoMax,
      estado_mecanico: "operativo",
    });

    return NextResponse.json(
      {
        id: contenedor.id_contenedor,
        tipoParacaidas: contenedor.tipo_paracaidas,
        pesoMax: contenedor.peso_maximo,
        envioId: contenedor.id_envio,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}
