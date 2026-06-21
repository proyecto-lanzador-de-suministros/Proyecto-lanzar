import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL no está definida en el entorno.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_ID || process.argv[2];
if (!ADMIN_CLERK_ID) {
  console.error("ERROR: Proporcioná tu ID de usuario de Clerk (admin).");
  console.error("  ADMIN_CLERK_ID=xxx npx tsx prisma/seed.ts");
  process.exit(1);
}

const REMITENTE_CLERK_ID = process.env.REMITENTE_CLERK_ID || "user_3EuGjxcKciHzkkhchnFjzsoUH5r";
const SOLICITANTE_CLERK_ID = process.env.SOLICITANTE_CLERK_ID || "user_3ExjiEpQ3ZnERLYtY6V1Ug1rLbc";

async function main() {
  console.log("Sembrando datos de prueba...\n");

  const now = new Date();
  const diasAtras = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date;
  };

  // ── 1. TIPOS DE PRODUCTO ────────────────────────────────────────────────
  console.log("1/8  Creando tipos de producto...");
  const tipos = [
    { id: "tipo-medico", nombre: "Suministros Médicos", peso: 5 },
    { id: "tipo-alimento", nombre: "Alimentos", peso: 3 },
    { id: "tipo-equipo", nombre: "Equipamiento", peso: 2 },
  ];
  for (const t of tipos) {
    await prisma.tipo.upsert({
      where: { id_tipo: t.id },
      update: {},
      create: { id_tipo: t.id, nombre_categoria: t.nombre, peso_prioridad: t.peso },
    });
  }
  console.log(`   ${tipos.length} tipos`);

  // ── 2. PRODUCTOS ────────────────────────────────────────────────────────
  console.log("2/8  Creando productos...");
  const productos = [
    { id: "prod-vacunas", nombre: "Vacunas y Suero Fisiológico", desc: "Kit térmico con vacunas esenciales y suero.", peso: 4.5, tipo: "tipo-medico" },
    { id: "prod-botiquin", nombre: "Botiquín de Primeros Auxilios", desc: "Gasas, desinfectante, bandages y medicamentos básicos.", peso: 1.5, tipo: "tipo-medico" },
    { id: "prod-alimento", nombre: "Raciones de Alimento Deshidratado", desc: "Comida de emergencia alta en calorías.", peso: 2.0, tipo: "tipo-alimento" },
    { id: "prod-filtros", nombre: "Filtros de Agua Portátiles", desc: "Filtros de emergencia para purificar agua.", peso: 0.5, tipo: "tipo-equipo" },
    { id: "prod-mantas", nombre: "Mantas Térmicas", desc: "Mantas de supervivencia reflectantes.", peso: 0.3, tipo: "tipo-equipo" },
    { id: "prod-radio", nombre: "Radio de Comunicación Satelital", desc: "Radio portátil con batería de largo alcance.", peso: 1.2, tipo: "tipo-equipo" },
    { id: "prod-generador", nombre: "Generador Eléctrico Portátil", desc: "Generador a gasolina de 2kW.", peso: 12.0, tipo: "tipo-equipo" },
  ];
  for (const p of productos) {
    await prisma.producto.upsert({
      where: { id_producto: p.id },
      update: {},
      create: {
        id_producto: p.id,
        nombre: p.nombre,
        descripcion: p.desc,
        peso_unitario: p.peso,
        id_tipo: p.tipo,
      },
    });
  }
  console.log(`   ${productos.length} productos`);

  // ── 3. ADMINISTRADOR ────────────────────────────────────────────────────
  console.log("3/8  Creando administrador...");
  // Orden: Usuario → AdministradorUsuario → Administrador (FK circular)
  await prisma.usuario.upsert({
    where: { id_usuario: ADMIN_CLERK_ID },
    update: {},
    create: {
      id_usuario: ADMIN_CLERK_ID,
      estado_cuenta: "APROBADA",
    },
  });
  await prisma.administradorUsuario.upsert({
    where: { id_usuario: ADMIN_CLERK_ID },
    update: {},
    create: { id_usuario: ADMIN_CLERK_ID },
  });
  await prisma.administrador.upsert({
    where: { id_admin: ADMIN_CLERK_ID },
    update: {},
    create: {
      id_admin: ADMIN_CLERK_ID,
      nombre: "Admin Principal",
      usuario: "admin_principal",
      permisos_rol: "admin",
    },
  });
  // Vincular Usuario → Administrador (FK opcional)
  await prisma.usuario.update({
    where: { id_usuario: ADMIN_CLERK_ID },
    data: { administradorId_admin: ADMIN_CLERK_ID },
  });
  console.log(`   Admin ${ADMIN_CLERK_ID}`);

  // ── 4. REMITENTES ───────────────────────────────────────────────────────
  console.log("4/8  Creando remitentes...");
  const remitentes = [
    { id: "remitente-bahia", nombre: "Base Central Bahía Blanca", lat: -38.7183, lng: -62.2663, pista: "Grande" },
    { id: "remitente-mdp", nombre: "Base Mar del Plata", lat: -37.9954, lng: -57.5426, pista: "Mediana" },
    { id: REMITENTE_CLERK_ID, nombre: "Base del Remitente", lat: -38.4161, lng: -63.6167, pista: "Mediana" },
  ];
  for (const r of remitentes) {
    await prisma.usuario.upsert({
      where: { id_usuario: r.id },
      update: {},
      create: { id_usuario: r.id, estado_cuenta: "APROBADA" },
    });
    await prisma.remitente.upsert({
      where: { id_remitente: r.id },
      update: {},
      create: {
        id_remitente: r.id,
        nombre_base: r.nombre,
        latitud_base: r.lat,
        longitud_base: r.lng,
        capacidad_pista: r.pista,
      },
    });
  }
  console.log(`   ${remitentes.length} remitentes`);

  // ── 5. SOLICITANTES ─────────────────────────────────────────────────────
  console.log("5/8  Creando solicitantes...");
  const solicitantes = [
    { id: "sol-maria", nombre: "María García", contacto: "maria@example.com" },
    { id: "sol-juan", nombre: "Juan Pérez", contacto: "juan@example.com" },
    { id: "sol-ana", nombre: "Ana López", contacto: "ana@example.com" },
    { id: "sol-carlos", nombre: "Carlos Mendoza", contacto: "carlos@example.com" },
    { id: SOLICITANTE_CLERK_ID, nombre: "Solicitante Principal", contacto: "solicitante@example.com" },
  ];
  for (const s of solicitantes) {
    await prisma.usuario.upsert({
      where: { id_usuario: s.id },
      update: {},
      create: { id_usuario: s.id, estado_cuenta: "APROBADA" },
    });
    await prisma.solicitante.upsert({
      where: { id_solicitante: s.id },
      update: {},
      create: { id_solicitante: s.id, nombre: s.nombre, contacto: s.contacto },
    });
  }
  console.log(`   ${solicitantes.length} solicitantes`);

  // ── 6. STOCK ────────────────────────────────────────────────────────────
  console.log("6/8  Creando stock...");
  const stocks = [
    { rem: "remitente-bahia", prod: "prod-vacunas", qty: 100 },
    { rem: "remitente-bahia", prod: "prod-botiquin", qty: 150 },
    { rem: "remitente-bahia", prod: "prod-alimento", qty: 200 },
    { rem: "remitente-bahia", prod: "prod-filtros", qty: 80 },
    { rem: "remitente-bahia", prod: "prod-mantas", qty: 120 },
    { rem: "remitente-bahia", prod: "prod-radio", qty: 30 },
    { rem: "remitente-bahia", prod: "prod-generador", qty: 10 },
    { rem: "remitente-mdp", prod: "prod-vacunas", qty: 60 },
    { rem: "remitente-mdp", prod: "prod-botiquin", qty: 90 },
    { rem: "remitente-mdp", prod: "prod-alimento", qty: 120 },
    { rem: "remitente-mdp", prod: "prod-filtros", qty: 50 },
    { rem: "remitente-mdp", prod: "prod-mantas", qty: 80 },
    { rem: "remitente-mdp", prod: "prod-radio", qty: 15 },
    { rem: REMITENTE_CLERK_ID, prod: "prod-vacunas", qty: 50 },
    { rem: REMITENTE_CLERK_ID, prod: "prod-botiquin", qty: 80 },
    { rem: REMITENTE_CLERK_ID, prod: "prod-alimento", qty: 100 },
    { rem: REMITENTE_CLERK_ID, prod: "prod-mantas", qty: 60 },
  ];
  const stockData = stocks.map(s => ({
    id_remitente: s.rem,
    id_producto: s.prod,
    cantidad_disponible: s.qty,
  }));
  await prisma.stock_Base.createMany({ data: stockData, skipDuplicates: true });
  console.log(`   ${stocks.length} registros`);

  // ── 7. SOLICITUDES ──────────────────────────────────────────────────────
  console.log("7/8  Creando solicitudes...");

  type SolicitudSeed = {
    id: string; estado: string; prioridad: string; solIdx: number;
    dias: number; rem?: string;
    motivoCancel?: string; motivoAnul?: string;
  };

  const solicitudes: SolicitudSeed[] = [
    { id: "sol-creada-01", estado: "Creada", prioridad: "Alta", solIdx: 1, dias: 0 },
    { id: "sol-creada-02", estado: "Creada", prioridad: "Media", solIdx: 3, dias: 0 },
    { id: "sol-creada-03", estado: "Creada", prioridad: "Baja", solIdx: 2, dias: 0 },
    { id: "sol-creada-04", estado: "Creada", prioridad: "Alta", solIdx: 4, dias: 0 },

    { id: "sol-asignada-01", estado: "Asignada", prioridad: "Alta", solIdx: 0, dias: 1, rem: "remitente-bahia" },
    { id: "sol-asignada-02", estado: "Asignada", prioridad: "Media", solIdx: 1, dias: 1, rem: "remitente-mdp" },

    { id: "sol-preparacion-01", estado: "EnPreparacion", prioridad: "Alta", solIdx: 2, dias: 2, rem: "remitente-bahia" },
    { id: "sol-preparacion-02", estado: "EnPreparacion", prioridad: "Baja", solIdx: 3, dias: 2, rem: "remitente-mdp" },

    { id: "sol-lista-01", estado: "Lista", prioridad: "Alta", solIdx: 0, dias: 3, rem: "remitente-bahia" },
    { id: "sol-lista-02", estado: "Lista", prioridad: "Media", solIdx: 1, dias: 3, rem: "remitente-mdp" },

    { id: "sol-camino-01", estado: "EnCamino", prioridad: "Alta", solIdx: 2, dias: 4, rem: "remitente-bahia" },
    { id: "sol-camino-02", estado: "EnCamino", prioridad: "Media", solIdx: 3, dias: 5, rem: "remitente-mdp" },

    { id: "sol-lanzada-01", estado: "Lanzada", prioridad: "Alta", solIdx: 0, dias: 6, rem: "remitente-bahia" },
    { id: "sol-lanzada-02", estado: "Lanzada", prioridad: "Baja", solIdx: 1, dias: 7, rem: "remitente-mdp" },

    { id: "sol-recibida-01", estado: "Recibida", prioridad: "Media", solIdx: 2, dias: 8, rem: "remitente-bahia" },
    { id: "sol-recibida-02", estado: "Recibida", prioridad: "Alta", solIdx: 3, dias: 10, rem: "remitente-mdp" },
    { id: "sol-recibida-03", estado: "Recibida", prioridad: "Baja", solIdx: 0, dias: 12, rem: "remitente-bahia" },

    { id: "sol-cancelada-01", estado: "Cancelada", prioridad: "Media", solIdx: 1, dias: 2, rem: "remitente-bahia", motivoCancel: "Falta de insumos disponibles" },
    { id: "sol-cancelada-02", estado: "Cancelada", prioridad: "Baja", solIdx: 2, dias: 5, rem: "remitente-mdp", motivoCancel: "Zona de destino inaccesible" },

    { id: "sol-anulada-01", estado: "Anulada", prioridad: "Alta", solIdx: 3, dias: 4, rem: "remitente-bahia", motivoAnul: "Solicitud duplicada" },
    { id: "sol-anulada-02", estado: "Anulada", prioridad: "Media", solIdx: 0, dias: 6, rem: "remitente-mdp", motivoAnul: "Ya no se necesita el suministro" },
  ];

  // Limpiar solicitudes de seeds anteriores para poder re-ejecutar
  const existingIds = await prisma.solicitud.findMany({
    where: { id_solicitud: { in: solicitudes.map(s => s.id) } },
    select: { id_solicitud: true },
  });
  const existingSet = new Set(existingIds.map(e => e.id_solicitud));

  let creadas = 0;
  for (const s of solicitudes) {
    if (existingSet.has(s.id)) {
      console.log(`   ~ ${s.id} ya existe`);
      continue;
    }
    const sol = solicitantes[s.solIdx];
    const prodIdx = s.solIdx % productos.length;
    const prod2Idx = (prodIdx + 1) % productos.length;

    await prisma.solicitud.create({
      data: {
        id_solicitud: s.id,
        estado_actual: s.estado,
        prioridad: s.prioridad,
        latitud_destino: -38.0 + Math.random() * 1.5,
        longitud_destino: -62.5 + Math.random() * 1.0,
        id_solicitante: sol.id,
        id_admin: ADMIN_CLERK_ID,
        id_remitente: s.rem ?? null,
        fecha_creacion: diasAtras(s.dias),
        motivo_cancelacion: s.motivoCancel ?? null,
        motivo_anulacion: s.motivoAnul ?? null,
        detalles: {
          create: [
            { id_producto: productos[prodIdx].id, cantidad_pedida: Math.floor(Math.random() * 30) + 5 },
            { id_producto: productos[prod2Idx].id, cantidad_pedida: Math.floor(Math.random() * 10) + 1 },
          ],
        },
      },
    });

    const historial = armarHistorial(s.estado);
    const historialesData = historial.map((est, i) => ({
      estado_anterior: i > 0 ? historial[i - 1] : null,
      estado_nuevo: est,
      id_solicitud: s.id,
      id_usuario: ADMIN_CLERK_ID,
      fecha_hora: diasAtras(s.dias - (historial.length - 1 - i)),
    }));
    await prisma.historial_Estado.createMany({ data: historialesData });

    creadas++;
  }

  // ── 8. NOTIFICACIONES ───────────────────────────────────────────────────
  console.log("8/8  Creando notificaciones...");
  const notifs = [
    { msg: "Bienvenido al sistema de gestión de lanzamientos." },
    { msg: "Nueva solicitud de alta prioridad de Juan Pérez." },
    { msg: "Solicitud sol-asignada-01 asignada a Base Bahía Blanca." },
    { msg: "Solicitud sol-recibida-01 completada exitosamente." },
    { msg: "Stock crítico: menos de 20 unidades de Vacunas en Bahía Blanca." },
  ];
  for (const n of notifs) {
    await prisma.notificacion.create({
      data: {
        mensaje: n.msg,
        id_usuario_destino: ADMIN_CLERK_ID,
      },
    });
  }

  console.log(`   ${notifs.length} notificaciones`);

  // ── RESUMEN ─────────────────────────────────────────────────────────────
  console.log("\nSeed completado exitosamente.");
  console.log("Resumen:");
  console.log("  Administradores: 1");
  console.log("  Tipos de producto: 3");
  console.log(`  Productos: ${productos.length}`);
  console.log(`  Remitentes: ${remitentes.length}`);
  console.log(`  Solicitantes: ${solicitantes.length}`);
  console.log(`  Stock: ${stocks.length} registros`);
  console.log(`  Solicitudes: ${creadas}`);
  console.log(`  Notificaciones: ${notifs.length}`);
  console.log("");
  console.log("Iniciá sesión con tu cuenta de Clerk y navegá a /admin/dashboard");
}

function armarHistorial(estadoActual: string): string[] {
  const estados = new Set<string>();
  if (estadoActual === "Creada" || estadoActual === "Cancelada" || estadoActual === "Anulada") {
    estados.add("Creada");
  }
  if (["Asignada", "EnPreparacion", "Lista", "EnCamino", "Lanzada", "Recibida", "Cancelada"].includes(estadoActual)) {
    estados.add("Creada"); estados.add("Asignada");
  }
  if (["EnPreparacion", "Lista", "EnCamino", "Lanzada", "Recibida"].includes(estadoActual)) {
    estados.add("EnPreparacion");
  }
  if (["Lista", "EnCamino", "Lanzada", "Recibida"].includes(estadoActual)) {
    estados.add("Lista");
  }
  if (["EnCamino", "Lanzada", "Recibida"].includes(estadoActual)) {
    estados.add("EnCamino");
  }
  if (["Lanzada", "Recibida"].includes(estadoActual)) {
    estados.add("Lanzada");
  }
  if (estadoActual === "Recibida") estados.add("Recibida");
  if (estadoActual === "Cancelada") estados.add("Cancelada");
  if (estadoActual === "Anulada") estados.add("Anulada");
  const orden = ["Creada", "Asignada", "EnPreparacion", "Lista", "EnCamino", "Lanzada", "Recibida", "Cancelada", "Anulada"];
  return orden.filter(e => estados.has(e));
}

main()
  .catch((e) => {
    console.error("\nError durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
