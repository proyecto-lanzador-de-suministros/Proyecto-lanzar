// Route handler de Next.js. Actúa como driver adapter HTTP para PATCH /api/solicitudes/:id/estado.
// Permite a un administrador actualizar el estado de cualquier solicitud.
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { solicitudesRepo } from "@/src/container";
import type { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

// Transiciones de estado permitidas por rol de admin
// (el remitente tiene las suyas propias en su propio flujo)
const TRANSICIONES_VALIDAS: Partial<Record<EstadoSolicitud, EstadoSolicitud[]>> = {
  creada: ["asignada", "rechazada", "cancelada", "anulada"],
  asignada: ["en_preparacion", "cancelada", "anulada"],
  en_preparacion: ["lista", "anulada"],
  lista: ["en_camino", "anulada"],
  en_camino: ["lanzada", "anulada"],
  lanzada: ["completada", "anulada"],
  // Estados terminales: no permiten transición
  completada: [],
  rechazada: [],
  cancelada: [],
  anulada: [],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { sessionClaims } = await auth.protect();

    if (sessionClaims?.metadata?.rol !== "admin") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const nuevoEstado: EstadoSolicitud = body?.nuevoEstado;

    if (!nuevoEstado) {
      return NextResponse.json(
        { error: "El campo nuevoEstado es requerido." },
        { status: 400 },
      );
    }

    // Buscar la solicitud actual
    const solicitud = await solicitudesRepo.buscarPorId(id);
    if (!solicitud) {
      return NextResponse.json(
        { error: "Solicitud no encontrada." },
        { status: 404 },
      );
    }

    // Validar transición de estado
    const transicionesPermitidas = TRANSICIONES_VALIDAS[solicitud.estado] ?? [];
    if (!transicionesPermitidas.includes(nuevoEstado)) {
      return NextResponse.json(
        {
          error: `Transición inválida: no se puede pasar de "${solicitud.estado}" a "${nuevoEstado}".`,
        },
        { status: 422 },
      );
    }

    // Guardar el nuevo estado
    await solicitudesRepo.guardar({ ...solicitud, estado: nuevoEstado });

    return NextResponse.json({ ok: true, nuevoEstado }, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/solicitudes/[id]/estado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}