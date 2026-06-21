import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

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

function point(lat: number, lng: number): string {
  return JSON.stringify({ lat, lng });
}

async function main() {
  console.log("Sembrando datos de prueba...\n");

  const now = new Date();
  const diasAtras = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date;
  };

  // ── 1. BASES ─────────────────────────────────────────────────────────────
  console.log("1/6  Creando bases...");
  const bases = [
    { id: "base-bahia", nombre: "Base Central Bahía Blanca", lat: -38.7183, lng: -62.2663, pista: "Grande" },
    { id: "base-mdp", nombre: "Base Mar del Plata", lat: -37.9954, lng: -57.5426, pista: "Mediana" },
    { id: "base-remitente", nombre: "Base del Remitente", lat: -38.4161, lng: -63.6167, pista: "Mediana" },
  ];
  for (const b of bases) {
    await prisma.base.upsert({
      where: { id_base: b.id },
      update: {},
      create: {
        id_base: b.id,
        nombre: b.nombre,
        posicion_base: point(b.lat, b.lng),
        direccion: "",
      },
    });
  }
  console.log(`   ${bases.length} bases`);

  // ── 2. PRODUCTOS ─────────────────────────────────────────────────────────
  console.log("2/6  Creando productos...");
  const productos = [
    { id: "prod-vacunas", nombre: "Vacunas y Suero Fisiológico", desc: "Kit térmico con vacunas esenciales y suero.", peso: 4.5, cat: "Suministros Médicos" },
    { id: "prod-botiquin", nombre: "Botiquín de Primeros Auxilios", desc: "Gasas, desinfectante, bandages y medicamentos básicos.", peso: 1.5, cat: "Suministros Médicos" },
    { id: "prod-alimento", nombre: "Raciones de Alimento Deshidratado", desc: "Comida de emergencia alta en calorías.", peso: 2.0, cat: "Alimentos" },
    { id: "prod-filtros", nombre: "Filtros de Agua Portátiles", desc: "Filtros de emergencia para purificar agua.", peso: 0.5, cat: "Equipamiento" },
    { id: "prod-mantas", nombre: "Mantas Térmicas", desc: "Mantas de supervivencia reflectantes.", peso: 0.3, cat: "Equipamiento" },
    { id: "prod-radio", nombre: "Radio de Comunicación Satelital", desc: "Radio portátil con batería de largo alcance.", peso: 1.2, cat: "Equipamiento" },
    { id: "prod-generador", nombre: "Generador Eléctrico Portátil", desc: "Generador a gasolina de 2kW.", peso: 12.0, cat: "Equipamiento" },
  ];
  for (const p of productos) {
    await prisma.producto.upsert({
      where: { id_producto: p.id },
      update: {},
      create: {
        id_producto: p.id,
        nombre: p.nombre,
        descripcion: p.desc,
        peso_kg: p.peso,
        categoria: p.cat,
      },
    });
  }
  console.log(`   ${productos.length} productos`);

  // ── 3. USUARIOS ──────────────────────────────────────────────────────────
  console.log("3/6  Creando usuarios...");
  // Admin
  await prisma.usuario.upsert({
    where: { id_usuario: ADMIN_CLERK_ID },
    update: {},
    create: {
      id_usuario: ADMIN_CLERK_ID,
      nombre: "Admin Principal",
      email: "admin@example.com",
      rol: "ADMINISTRADOR",
      estado_cuenta: "APROBADA",
    },
  });

  // Remitentes
  const remitentes = [
    { id: "remitente-bahia", nombre: "Base Bahía Blanca", baseIdx: 0 },
    { id: "remitente-mdp", nombre: "Base Mar del Plata", baseIdx: 1 },
    { id: REMITENTE_CLERK_ID, nombre: "Base del Remitente", baseIdx: 2 },
  ];
  for (const r of remitentes) {
    await prisma.usuario.upsert({
      where: { id_usuario: r.id },
      update: {},
      create: {
        id_usuario: r.id,
        nombre: r.nombre,
        rol: "REMITENTE",
        estado_cuenta: "APROBADA",
        id_base: bases[r.baseIdx].id,
      },
    });
  }

  // Solicitantes
  const solicitantes = [
    { id: "sol-maria", nombre: "María García", email: "maria@example.com" },
    { id: "sol-juan", nombre: "Juan Pérez", email: "juan@example.com" },
    { id: "sol-ana", nombre: "Ana López", email: "ana@example.com" },
    { id: "sol-carlos", nombre: "Carlos Mendoza", email: "carlos@example.com" },
    { id: SOLICITANTE_CLERK_ID, nombre: "Solicitante Principal", email: "solicitante@example.com" },
  ];
  for (const s of solicitantes) {
    await prisma.usuario.upsert({
      where: { id_usuario: s.id },
      update: {},
      create: {
        id_usuario: s.id,
        nombre: s.nombre,
        email: s.email,
        rol: "SOLICITANTE",
        estado_cuenta: "APROBADA",
      },
    });
  }
  const totalUsuarios = 1 + remitentes.length + solicitantes.length;
  console.log(`   ${totalUsuarios} usuarios (1 admin, ${remitentes.length} remitentes, ${solicitantes.length} solicitantes)`);

  // ── 4. STOCK ────────────────────────────────────────────────────────────
  console.log("4/6  Creando stock...");
  const stocks = [
    { base: "base-bahia", prod: "prod-vacunas", qty: 100 },
    { base: "base-bahia", prod: "prod-botiquin", qty: 150 },
    { base: "base-bahia", prod: "prod-alimento", qty: 200 },
    { base: "base-bahia", prod: "prod-filtros", qty: 80 },
    { base: "base-bahia", prod: "prod-mantas", qty: 120 },
    { base: "base-bahia", prod: "prod-radio", qty: 30 },
    { base: "base-bahia", prod: "prod-generador", qty: 10 },
    { base: "base-mdp", prod: "prod-vacunas", qty: 60 },
    { base: "base-mdp", prod: "prod-botiquin", qty: 90 },
    { base: "base-mdp", prod: "prod-alimento", qty: 120 },
    { base: "base-mdp", prod: "prod-filtros", qty: 50 },
    { base: "base-mdp", prod: "prod-mantas", qty: 80 },
    { base: "base-mdp", prod: "prod-radio", qty: 15 },
    { base: "base-remitente", prod: "prod-vacunas", qty: 50 },
    { base: "base-remitente", prod: "prod-botiquin", qty: 80 },
    { base: "base-remitente", prod: "prod-alimento", qty: 100 },
    { base: "base-remitente", prod: "prod-mantas", qty: 60 },
  ];
  await prisma.stock_Base.createMany({
    data: stocks.map(s => ({ id_base: s.base, id_producto: s.prod, cantidad_disponible: s.qty })),
    skipDuplicates: true,
  });
  console.log(`   ${stocks.length} registros`);

  // ── 5. SOLICITUDES ──────────────────────────────────────────────────────
  console.log("5/6  Creando solicitudes...");

  type SolicitudSeed = {
    id: string; estado: string; prioridad: string; solIdx: number;
    dias: number; base?: string;
    motivoCancel?: string; motivoAnul?: string;
  };

  const solicitudes: SolicitudSeed[] = [
    { id: "sol-creada-01", estado: "Creada", prioridad: "Alta", solIdx: 1, dias: 0 },
    { id: "sol-creada-02", estado: "Creada", prioridad: "Media", solIdx: 3, dias: 0 },
    { id: "sol-creada-03", estado: "Creada", prioridad: "Baja", solIdx: 2, dias: 0 },
    { id: "sol-creada-04", estado: "Creada", prioridad: "Alta", solIdx: 4, dias: 0 },
    { id: "sol-asignada-01", estado: "Asignada", prioridad: "Alta", solIdx: 0, dias: 1, base: "base-bahia" },
    { id: "sol-asignada-02", estado: "Asignada", prioridad: "Media", solIdx: 1, dias: 1, base: "base-mdp" },
    { id: "sol-preparacion-01", estado: "EnPreparacion", prioridad: "Alta", solIdx: 2, dias: 2, base: "base-bahia" },
    { id: "sol-preparacion-02", estado: "EnPreparacion", prioridad: "Baja", solIdx: 3, dias: 2, base: "base-mdp" },
    { id: "sol-lista-01", estado: "Lista", prioridad: "Alta", solIdx: 0, dias: 3, base: "base-bahia" },
    { id: "sol-lista-02", estado: "Lista", prioridad: "Media", solIdx: 1, dias: 3, base: "base-mdp" },
    { id: "sol-camino-01", estado: "EnCamino", prioridad: "Alta", solIdx: 2, dias: 4, base: "base-bahia" },
    { id: "sol-camino-02", estado: "EnCamino", prioridad: "Media", solIdx: 3, dias: 5, base: "base-mdp" },
    { id: "sol-lanzada-01", estado: "Lanzada", prioridad: "Alta", solIdx: 0, dias: 6, base: "base-bahia" },
    { id: "sol-lanzada-02", estado: "Lanzada", prioridad: "Baja", solIdx: 1, dias: 7, base: "base-mdp" },
    { id: "sol-recibida-01", estado: "Recibida", prioridad: "Media", solIdx: 2, dias: 8, base: "base-bahia" },
    { id: "sol-recibida-02", estado: "Recibida", prioridad: "Alta", solIdx: 3, dias: 10, base: "base-mdp" },
    { id: "sol-recibida-03", estado: "Recibida", prioridad: "Baja", solIdx: 0, dias: 12, base: "base-bahia" },
    { id: "sol-cancelada-01", estado: "Cancelada", prioridad: "Media", solIdx: 1, dias: 2, base: "base-bahia", motivoCancel: "Falta de insumos disponibles" },
    { id: "sol-cancelada-02", estado: "Cancelada", prioridad: "Baja", solIdx: 2, dias: 5, base: "base-mdp", motivoCancel: "Zona de destino inaccesible" },
    { id: "sol-anulada-01", estado: "Anulada", prioridad: "Alta", solIdx: 3, dias: 4, base: "base-bahia", motivoAnul: "Solicitud duplicada" },
    { id: "sol-anulada-02", estado: "Anulada", prioridad: "Media", solIdx: 0, dias: 6, base: "base-mdp", motivoAnul: "Ya no se necesita el suministro" },
  ];

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
    const sol = solicitantes[s.solIdx] ?? solicitantes[0];
    const prodIdx = s.solIdx % productos.length;
    const prod2Idx = (prodIdx + 1) % productos.length;

    await prisma.solicitud.create({
      data: {
        id_solicitud: s.id,
        estado: s.estado,
        prioridad: s.prioridad,
        ubicacion_destino: point(-38.0 + Math.random() * 1.5, -62.5 + Math.random() * 1.0),
        id_usuario: sol.id,
        id_admin: ADMIN_CLERK_ID,
        id_base: s.base ?? null,
        fecha_solicitada: diasAtras(s.dias),
        motivo_cancelacion: s.motivoCancel ?? null,
        motivo_anulacion: s.motivoAnul ?? null,
        detalles: {
          create: [
            { id_producto: productos[prodIdx].id, cantidad_solicitada: Math.floor(Math.random() * 30) + 5 },
            { id_producto: productos[prod2Idx].id, cantidad_solicitada: Math.floor(Math.random() * 10) + 1 },
          ],
        },
      },
    });

    const historial = armarHistorial(s.estado);
    await prisma.historial_Estado.createMany({
      data: historial.map((est, i) => ({
        est_ant: i > 0 ? historial[i - 1] : null,
        est_nue: est,
        id_solicitud: s.id,
        id_usuario: ADMIN_CLERK_ID,
        fecha_hora: diasAtras(s.dias - (historial.length - 1 - i)),
      })),
    });

    creadas++;
  }
  console.log(`   ${creadas} solicitudes`);

  // ── 6. NOTIFICACIONES ───────────────────────────────────────────────────
  console.log("6/6  Creando notificaciones...");
  const notifs = [
    { msg: "Bienvenido al sistema de gestión de lanzamientos." },
    { msg: "Nueva solicitud de alta prioridad de Juan Pérez." },
    { msg: "Solicitud sol-asignada-01 asignada a Base Bahía Blanca." },
    { msg: "Solicitud sol-recibida-01 completada exitosamente." },
    { msg: "Stock crítico: menos de 20 unidades de Vacunas en Bahía Blanca." },
  ];
  await prisma.notificacion.createMany({
    data: notifs.map(n => ({ mensaje: n.msg, id_usuario: ADMIN_CLERK_ID })),
    skipDuplicates: true,
  });
  console.log(`   ${notifs.length} notificaciones`);

  console.log("\nSeed completado exitosamente.");
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
