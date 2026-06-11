// Route handler de Next.js. Actúa como driver adapter HTTP para GET /api/admin/solicitudes.
// Requiere sesión activa con rol "admin" en los claims de Clerk.
import { NextRequest, NextResponse } from "next/server";
import { listarSolicitudesAdmin } from "@/src/container";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Proteger la ruta: redirige a sign-in si no hay sesión activa
    const { sessionClaims } = await auth.protect();

    // 2. Verificar que el usuario autenticado tenga el rol correcto
    if (sessionClaims?.metadata?.rol !== "admin") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 },
      );
    }

    // 3. Leer parámetros de filtrado desde la query string
    const searchParams = req.nextUrl.searchParams;
    const estado = searchParams.get("estado") || undefined;

    // 4. Delegar al caso de uso
    const solicitudes = await listarSolicitudesAdmin.ejecutar(estado);

    return NextResponse.json(solicitudes, { status: 200 });
  } catch (error) {
    // auth.protect() lanza una excepción redirigiendo si no hay sesión;
    // no interceptamos esa redirección. Cualquier otro error sí lo logueamos.
    console.error("Error en GET /api/admin/solicitudes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}