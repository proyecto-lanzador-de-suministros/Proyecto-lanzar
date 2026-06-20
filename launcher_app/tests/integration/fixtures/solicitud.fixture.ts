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

export async function seedBaseRemitente(prisma: PrismaClient, overrides?: {
  id?: string;
  nombre_base?: string;
  estado_cuenta?: string;
}) {
  const id = overrides?.id ?? crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: id,
      estado_cuenta: overrides?.estado_cuenta ?? "APROBADA",
      remitente: {
        create: {
          nombre_base: overrides?.nombre_base ?? "Base Test",
          latitud_base: -38.7183,
          longitud_base: -62.2663,
          capacidad_pista: "Grande",
        },
      },
    },
  });

  return id;
}

export async function seedAdmin(prisma: PrismaClient) {
  const id = crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: id,
      estado_cuenta: "APROBADA",
      administrador: {
        create: {
          id_admin: id,
          nombre: "Admin Test",
          usuario: "admin_test",
          permisos_rol: "admin",
        },
      },
    },
  });

  return id;
}

export async function seedProductos(prisma: PrismaClient, idBase?: string) {
  const tipo = await prisma.tipo.create({
    data: {
      nombre_categoria: "Suministros Médicos",
      peso_prioridad: 1,
    },
  });

  const prod1 = await prisma.producto.create({
    data: {
      nombre: "Vacunas y Suero Fisiológico",
      descripcion: "Kit térmico con vacunas esenciales y suero.",
      peso_unitario: 4.5,
      id_tipo: tipo.id_tipo,
    },
  });

  const prod2 = await prisma.producto.create({
    data: {
      nombre: "Botiquín de Primeros Auxilios",
      descripcion: "Gasas, desinfectante, bandages y medicamentos básicos.",
      peso_unitario: 1.5,
      id_tipo: tipo.id_tipo,
    },
  });

  if (idBase) {
    await prisma.stock_Base.createMany({
      data: [
        { id_remitente: idBase, id_producto: prod1.id_producto, cantidad_disponible: 100 },
        { id_remitente: idBase, id_producto: prod2.id_producto, cantidad_disponible: 150 },
      ],
    });
  }

  return { prod1, prod2 };
}

export async function limpiarBase(prisma: PrismaClient) {
  await prisma.notificacion.deleteMany();
  await prisma.historial_Estado.deleteMany();
  await prisma.detalle_Solicitud.deleteMany();
  await prisma.lanzamiento.deleteMany();
  await prisma.stock_Base.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.tipo.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.solicitante.deleteMany();
  await prisma.administradorUsuario.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.remitente.deleteMany();
  await prisma.usuario.deleteMany();
}
