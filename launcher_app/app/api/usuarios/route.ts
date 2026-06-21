import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listarUsuariosUseCase } from "@/src/container";
import { handleDomainError } from "@/src/infrastructure/errors/handleDomainError";

export async function GET() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.rol !== "admin") {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Acceso denegado." } }, { status: 403 });
  }

  try {
    const usuarios = await listarUsuariosUseCase.ejecutar();
    const response = usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre ?? "Usuario Sin Nombre",
      email: u.id,
      rol: u.rol.toLowerCase(),
      baseId: null,
    }));

    return NextResponse.json(response);
  } catch (error: unknown) {
    const { code, message, httpStatus } = handleDomainError(error);
    return NextResponse.json({ error: { code, message } }, { status: httpStatus });
  }
}
