// Route handler de Next.js. Actúa como driver adapter HTTP para POST /api/solicitudes, delega al caso de uso CrearSolicitud.
import { crearSolicitud } from "@/src/container";

export async function POST(req: Request) {
  const body = await req.json();

  const solicitud = await crearSolicitud.ejecutar({
    remitente: body.remitente,
    solicitante: body.solicitante,
    descripcion: body.descripcion,
  });

  return Response.json(solicitud, { status: 201 });
}
