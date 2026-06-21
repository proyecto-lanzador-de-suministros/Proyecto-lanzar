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
  const baseId = overrides?.id ?? crypto.randomUUID();
  const userId = crypto.randomUUID();

  await prisma.base.create({
    data: {
      id_base: baseId,
      nombre: overrides?.nombre_base ?? "Base Test",
      latitud: -38.7183,
      longitud: -62.2663,
      direccion: "Test Address",
      capacidad_pista: "Grande",
    },
  });

  await prisma.usuario.create({
    data: {
      id_usuario: userId,
      estado_cuenta: overrides?.estado_cuenta ?? "APROBADA",
      remitente: {
        create: {
          id_base: baseId,
        },
      },
    },
  });

  return baseId;
}

export async function seedAdmin(prisma: PrismaClient) {
  const id = crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: id,
      estado_cuenta: "APROBADA",
      administrador: {
        create: {
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
  const prod1 = await prisma.producto.create({
    data: {
      nombre: "Vacunas y Suero Fisiológico",
      descripcion: "Kit térmico con vacunas esenciales y suero.",
      peso_unitario: 4.5,
      categoria: "Suministros Médicos",
    },
  });

  const prod2 = await prisma.producto.create({
    data: {
      nombre: "Botiquín de Primeros Auxilios",
      descripcion: "Gasas, desinfectante, bandages y medicamentos básicos.",
      peso_unitario: 1.5,
      categoria: "Suministros Médicos",
    },
  });

  if (idBase) {
    await prisma.stock_Base.createMany({
      data: [
        { id_base: idBase, id_producto: prod1.id_producto, cantidad_disponible: 100 },
        { id_base: idBase, id_producto: prod2.id_producto, cantidad_disponible: 150 },
      ],
    });
  }

  return { prod1, prod2 };
}

export async function limpiarBase(prisma: PrismaClient) {
  await prisma.notificacion.deleteMany();
  await prisma.historial_Estado.deleteMany();
  await prisma.historial_Stock.deleteMany();
  await prisma.detalle_Solicitud.deleteMany();
  await prisma.contenedor.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.stock_Base.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.solicitante.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.remitente.deleteMany();
  await prisma.base.deleteMany();
  await prisma.usuario.deleteMany();
}
