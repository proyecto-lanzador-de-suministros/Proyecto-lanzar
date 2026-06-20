import { PrismaClient } from "@/src/generated/prisma";

export async function crearSolicitanteFixture(
  prisma: PrismaClient,
  overrides?: {
    idUsuario?: string;
    nombre?: string;
    contacto?: string;
    estadoCuenta?: string;
  },
) {
  const id = overrides?.idUsuario ?? crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: id,
      estado_cuenta: overrides?.estadoCuenta ?? "APROBADA",
      solicitante: {
        create: {
          nombre: overrides?.nombre ?? "Solicitante Test",
          contacto: overrides?.contacto ?? "solicitante@test.com",
        },
      },
    },
  });

  return { idUsuario: id };
}

export async function crearRemitenteFixture(
  prisma: PrismaClient,
  overrides?: {
    idUsuario?: string;
    nombreBase?: string;
    latitud?: number;
    longitud?: number;
    capacidadPista?: string;
  },
) {
  const id = overrides?.idUsuario ?? crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: id,
      estado_cuenta: "APROBADA",
      remitente: {
        create: {
          nombre_base: overrides?.nombreBase ?? "Base Test",
          latitud_base: overrides?.latitud ?? -34.6037,
          longitud_base: overrides?.longitud ?? -58.3816,
          capacidad_pista: overrides?.capacidadPista ?? "grande",
        },
      },
    },
  });

  return { idUsuario: id, idRemitente: id };
}

export async function crearAdminFixture(
  prisma: PrismaClient,
  overrides?: {
    idUsuario?: string;
    nombre?: string;
    usuario?: string;
    permisosRol?: string;
  },
) {
  const id = overrides?.idUsuario ?? crypto.randomUUID();

  await prisma.usuario.create({
    data: {
      id_usuario: id,
      estado_cuenta: "APROBADA",
    },
  });

  await prisma.administrador.create({
    data: {
      id_admin: id,
      nombre: overrides?.nombre ?? "Admin Test",
      usuario: overrides?.usuario ?? "admin_test",
      permisos_rol: overrides?.permisosRol ?? "full",
    },
  });

  await prisma.administradorUsuario.create({
    data: {
      id_usuario: id,
    },
  });

  await prisma.usuario.update({
    where: { id_usuario: id },
    data: { administradorId_admin: id },
  });

  return { idUsuario: id, idAdmin: id };
}

export async function crearProductoFixture(
  prisma: PrismaClient,
  overrides?: {
    idProducto?: string;
    idTipo?: string;
    nombre?: string;
    categoria?: string;
    pesoUnitario?: number;
    pesoPrioridad?: number;
  },
) {
  const idTipo = overrides?.idTipo ?? crypto.randomUUID();
  const idProducto = overrides?.idProducto ?? crypto.randomUUID();

  await prisma.tipo.create({
    data: {
      id_tipo: idTipo,
      nombre_categoria: overrides?.categoria ?? "Alimentos",
      peso_prioridad: overrides?.pesoPrioridad ?? 1,
    },
  });

  await prisma.producto.create({
    data: {
      id_producto: idProducto,
      nombre: overrides?.nombre ?? "Producto Test",
      descripcion: "Descripción test",
      peso_unitario: overrides?.pesoUnitario ?? 1.0,
      id_tipo: idTipo,
    },
  });

  return { idTipo, idProducto };
}

export async function crearStockFixture(
  prisma: PrismaClient,
  overrides: {
    idRemitente: string;
    idProducto: string;
    cantidad?: number;
  },
) {
  const stock = await prisma.stock_Base.create({
    data: {
      id_remitente: overrides.idRemitente,
      id_producto: overrides.idProducto,
      cantidad_disponible: overrides.cantidad ?? 10,
    },
  });

  return { idStock: stock.id_stock };
}

export async function crearDetalleSolicitudFixture(
  prisma: PrismaClient,
  overrides: {
    idSolicitud: string;
    idProducto: string;
    cantidad?: number;
  },
) {
  const detalle = await prisma.detalle_Solicitud.create({
    data: {
      id_solicitud: overrides.idSolicitud,
      id_producto: overrides.idProducto,
      cantidad_pedida: overrides.cantidad ?? 1,
    },
  });

  return { idDetalle: detalle.id_detalle };
}
