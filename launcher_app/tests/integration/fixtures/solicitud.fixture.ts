import { PrismaClient } from "@/src/generated/prisma";

export async function crearSolicitudFixture(
  prisma: PrismaClient,
  overrides?: {
    idSolicitud?: string;
    estado?: string;
  },
) {
  const idUsuario = crypto.randomUUID();
  const idSolicitud = overrides?.idSolicitud ?? crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: idUsuario,
      estado_cuenta: "APROBADA",
      solicitante: {
        create: {
          nombre: "Solicitante Test",
          contacto: "test@test.com",
        },
      },
    },
  });

  const solicitud = await prisma.solicitud.create({
    data: {
      id_solicitud: idSolicitud,
      estado_actual: overrides?.estado ?? "Creada",
      prioridad: "Media",
      latitud_destino: -38.7,
      longitud_destino: -62.27,
      id_solicitante: idUsuario,
    },
  });

  return { solicitud, idUsuario, idSolicitud };
}
