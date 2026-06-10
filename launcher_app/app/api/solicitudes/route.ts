// Route handler de Next.js. Actúa como driver adapter HTTP para POST /api/solicitudes, delega al caso de uso CrearSolicitud.
import { crearSolicitud } from "@/src/container";

export async function POST(req: Request) {
  const body = await req.json();

  const solicitud = await crearSolicitud.ejecutar({
    id_base: body.id_base,
    id_usuario: body.id_usuario,
    prioridad: body.prioridad,
    ubicacion_destino: body.ubicacion_destino,
    fecha_entrega: new Date(body.fecha_entrega),
  });

  return Response.json(solicitud, { status: 201 });
}
