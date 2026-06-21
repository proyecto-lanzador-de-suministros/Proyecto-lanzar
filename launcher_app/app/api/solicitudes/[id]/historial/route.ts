import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { historialRepository } from "@/src/container";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "No autenticado." } }, { status: 401 });
  }

  try {
    const { id } = await params;
    const entries = await historialRepository.listarPorSolicitud(id);

    const response = entries.map((e) => ({
      id: e.id,
      fechaHora: e.fechaHora.toISOString(),
      estadoAnterior: e.estadoAnterior ?? null,
      estadoNuevo: e.estadoNuevo,
      usuarioId: e.actorId,
    }));

    return NextResponse.json(response);
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}
