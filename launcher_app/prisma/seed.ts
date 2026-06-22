import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { createClerkClient } from "@clerk/backend";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL no está definida en el entorno.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// ── Tipos ───────────────────────────────────────────────────────────────────

interface ClerkUserSeed {
  id: string;
  role: "admin" | "remitente" | "solicitante";
  name: string;
  email: string;
}

interface SolicitudSeed {
  id: string;
  estado: string;
  prioridad: string;
  solicitante: ClerkUserSeed;
  dias: number;
  base?: string;
  motivoCancel?: string;
  motivoAnul?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function point(lat: number, lng: number): string {
  return JSON.stringify({ lat, lng });
}

function armarHistorial(estadoActual: string): string[] {
  const estados = new Set<string>();
  if (["Creada", "Cancelada", "Anulada"].includes(estadoActual))
    estados.add("Creada");
  if (["Asignada", "En preparación", "Lista", "En camino", "Lanzada", "Completada", "Cancelada"].includes(estadoActual))
    { estados.add("Creada"); estados.add("Asignada"); }
  if (["En preparación", "Lista", "En camino", "Lanzada", "Completada"].includes(estadoActual))
    estados.add("En preparación");
  if (["Lista", "En camino", "Lanzada", "Completada"].includes(estadoActual))
    estados.add("Lista");
  if (["En camino", "Lanzada", "Completada"].includes(estadoActual))
    estados.add("En camino");
  if (["Lanzada", "Completada"].includes(estadoActual))
    estados.add("Lanzada");
  if (estadoActual === "Completada") estados.add("Completada");
  if (estadoActual === "Cancelada") estados.add("Cancelada");
  if (estadoActual === "Anulada") estados.add("Anulada");
  const orden = ["Creada", "Asignada", "En preparación", "Lista", "En camino", "Lanzada", "Completada", "Cancelada", "Anulada"];
  return orden.filter(e => estados.has(e));
}

// ── Obtener usuarios desde Clerk ────────────────────────────────────────────

async function obtenerUsuariosClerk(): Promise<ClerkUserSeed[]> {
  console.log("\nObteniendo usuarios desde Clerk...");

  const raw: Array<{ id: string; role: "solicitante" | "remitente" | "admin" }> = [];

  for (const [key, value] of Object.entries(process.env)) {
    const match = key.match(/^(solicitante|remitente|admin)(\d+)$/);
    if (match && value) {
      raw.push({ id: value, role: match[1] as any });
    }
  }

  const legacy: Record<string, "admin" | "remitente" | "solicitante"> = {
    ADMIN_CLERK_ID: "admin",
    REMITENTE_CLERK_ID: "remitente",
    SOLICITANTE_CLERK_ID: "solicitante",
  };
  for (const [envKey, role] of Object.entries(legacy)) {
    const value = process.env[envKey];
    if (value && !raw.some(u => u.id === value)) {
      raw.push({ id: value, role });
    }
  }

  const unique = raw.filter((u, i, a) => a.findIndex(x => x.id === u.id) === i);
  console.log(`   ${unique.length} IDs de Clerk encontrados en .env`);

  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  const resultados = await Promise.allSettled(
    unique.map(u =>
      clerk.users.getUser(u.id).then(user => ({
        id: user.id,
        role: u.role,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || u.role,
        email: (user.emailAddresses?.[0] as any)?.emailAddress ?? `${u.role}@clerk.com`,
      }))
    )
  );

  const users: ClerkUserSeed[] = [];
  for (const r of resultados) {
    if (r.status === "fulfilled") {
      users.push(r.value);
    } else {
      console.warn(`   ⚠ No se pudo obtener datos de Clerk para un usuario: ${r.reason}`);
    }
  }

  if (users.length === 0) {
    console.error("ERROR: No se pudo obtener ningún usuario de Clerk.");
    process.exit(1);
  }

  console.log(`   ${users.length} usuarios obtenidos de Clerk`);
  for (const u of users) {
    console.log(`     ${u.id.slice(0, 20)}… | ${u.role.padEnd(12)} | ${u.name.padEnd(20)} | ${u.email}`);
  }

  return users;
}

// ── Limpiar base de datos ───────────────────────────────────────────────────

async function limpiarBaseDeDatos() {
  console.log("\nLimpiando base de datos existente...");
  await prisma.contenedor.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.historial_Estado.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.historial_Stock.deleteMany();
  await prisma.detalle_Solicitud.deleteMany();
  await prisma.stock_Base.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.base.deleteMany();
  await prisma.producto.deleteMany();
  console.log("   Base de datos limpiada.");
}

// ── Seed principal ──────────────────────────────────────────────────────────

async function main() {
  console.log("=== Seed: Inicializando datos de prueba ===\n");

  const now = new Date();
  const diasAtras = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date;
  };

  const users = await obtenerUsuariosClerk();

  // Separar por rol
  const admins = users.filter(u => u.role === "admin");
  const remitentesRaw = users.filter(u => u.role === "remitente");
  const solicitantes = users.filter(u => u.role === "solicitante");

  if (admins.length === 0) {
    console.error("ERROR: Se necesita al menos un admin en Clerk.");
    process.exit(1);
  }
  if (solicitantes.length === 0) {
    console.error("ERROR: Se necesita al menos un solicitante en Clerk.");
    process.exit(1);
  }

  const admin = admins[0];

  await limpiarBaseDeDatos();

  // ── 1. BASES ────────────────────────────────────────────────────────────
  console.log("\n1/6  Creando bases...");
  const bases = [
    { id: "base-bahia", nombre: "Base Central Bahía Blanca", lat: -38.7183, lng: -62.2663 },
    { id: "base-mdp", nombre: "Base Mar del Plata", lat: -37.9954, lng: -57.5426 },
    { id: "base-remitente", nombre: "Base del Remitente", lat: -38.4161, lng: -63.6167 },
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

  // ── 2. PRODUCTOS ────────────────────────────────────────────────────────
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

  // ── 3. USUARIOS ─────────────────────────────────────────────────────────
  console.log("3/6  Creando usuarios...");

  // Asignar remitentes a bases (distribución equitativa)
  const remitentes = remitentesRaw.map((r, i) => ({
    ...r,
    baseId: bases[i % bases.length].id,
  }));

  for (const u of users) {
    const rem = remitentes.find(r => r.id === u.id);
    await prisma.usuario.upsert({
      where: { id_usuario: u.id },
      update: {},
      create: {
        id_usuario: u.id,
        nombre: u.name,
        email: u.email,
        rol: u.role === "admin" ? "ADMINISTRADOR" : u.role === "remitente" ? "REMITENTE" : "SOLICITANTE",
        estado_cuenta: "APROBADA",
        id_base: rem?.baseId ?? null,
      },
    });
  }
  console.log(`   ${users.length} usuarios (${admins.length} admin, ${remitentes.length} remitentes, ${solicitantes.length} solicitantes)`);

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

  // ── 5. SOLICITUDES ─────────────────────────────────────────────────────
  console.log("5/6  Creando solicitudes...");

  const prioridades = ["Alta", "Media", "Baja", "Urgente"];

  const solicitudes: SolicitudSeed[] = [
    // Solicitante 1 (Juan Pablo) — 4 solicitudes
    { id: "sol-creada-01", estado: "Creada", prioridad: "Alta", solicitante: solicitantes[0], dias: 0 },
    { id: "sol-asignada-01", estado: "Asignada", prioridad: "Media", solicitante: solicitantes[0], dias: 1, base: "base-bahia" },
    { id: "sol-preparacion-01", estado: "En preparación", prioridad: "Alta", solicitante: solicitantes[0], dias: 2, base: "base-bahia" },
    { id: "sol-completada-01", estado: "Completada", prioridad: "Media", solicitante: solicitantes[0], dias: 8, base: "base-bahia" },

    // Solicitante 3 — 4 solicitudes
    { id: "sol-creada-02", estado: "Creada", prioridad: "Baja", solicitante: solicitantes[1], dias: 0 },
    { id: "sol-asignada-02", estado: "Asignada", prioridad: "Urgente", solicitante: solicitantes[1], dias: 1, base: "base-mdp" },
    { id: "sol-lista-01", estado: "Lista", prioridad: "Media", solicitante: solicitantes[1], dias: 3, base: "base-mdp" },
    { id: "sol-cancelada-01", estado: "Cancelada", prioridad: "Baja", solicitante: solicitantes[1], dias: 4, base: "base-mdp", motivoCancel: "El solicitante ya no necesita los suministros" },

    // Solicitante 4 — 4 solicitudes
    { id: "sol-creada-03", estado: "Creada", prioridad: "Alta", solicitante: solicitantes[2], dias: 0 },
    { id: "sol-preparacion-02", estado: "En preparación", prioridad: "Alta", solicitante: solicitantes[2], dias: 2, base: "base-bahia" },
    { id: "sol-camino-01", estado: "En camino", prioridad: "Media", solicitante: solicitantes[2], dias: 5, base: "base-bahia" },
    { id: "sol-completada-02", estado: "Completada", prioridad: "Alta", solicitante: solicitantes[2], dias: 10, base: "base-bahia" },

    // Solicitante 6 — 4 solicitudes
    { id: "sol-creada-04", estado: "Creada", prioridad: "Media", solicitante: solicitantes[3], dias: 0 },
    { id: "sol-asignada-03", estado: "Asignada", prioridad: "Baja", solicitante: solicitantes[3], dias: 1, base: "base-remitente" },
    { id: "sol-lanzada-01", estado: "Lanzada", prioridad: "Alta", solicitante: solicitantes[3], dias: 6, base: "base-remitente" },
    { id: "sol-anulada-01", estado: "Anulada", prioridad: "Media", solicitante: solicitantes[3], dias: 5, base: "base-remitente", motivoAnul: "Solicitud duplicada generada por error" },

    // Solicitante 10 — 4 solicitudes
    { id: "sol-creada-05", estado: "Creada", prioridad: "Alta", solicitante: solicitantes[4], dias: 0 },
    { id: "sol-asignada-04", estado: "Asignada", prioridad: "Media", solicitante: solicitantes[4], dias: 1, base: "base-mdp" },
    { id: "sol-camino-02", estado: "En camino", prioridad: "Alta", solicitante: solicitantes[4], dias: 4, base: "base-mdp" },
    { id: "sol-completada-03", estado: "Completada", prioridad: "Baja", solicitante: solicitantes[4], dias: 12, base: "base-mdp" },

    // Extras
    { id: "sol-urgente-01", estado: "Creada", prioridad: "Urgente", solicitante: solicitantes[0], dias: 0 },
    { id: "sol-cancelada-02", estado: "Cancelada", prioridad: "Media", solicitante: solicitantes[2], dias: 3, base: "base-bahia", motivoCancel: "Zona de destino inaccesible por condiciones climáticas" },
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

    const prodIdx = Math.floor(Math.random() * (productos.length - 1));
    const prod2Idx = (prodIdx + 1 + Math.floor(Math.random() * (productos.length - 1))) % productos.length;

    await prisma.solicitud.create({
      data: {
        id_solicitud: s.id,
        estado: s.estado,
        prioridad: s.prioridad,
        ubicacion_destino: point(-38.0 + Math.random() * 1.5, -62.5 + Math.random() * 1.0),
        id_usuario: s.solicitante.id,
        id_admin: admin.id,
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
        id_usuario: admin.id,
        fecha_hora: diasAtras(s.dias - (historial.length - 1 - i)),
      })),
    });

    creadas++;
  }
  console.log(`   ${creadas} solicitudes creadas (${solicitudes.length - creadas} existentes)`);

  // ── 6. NOTIFICACIONES ────────────────────────────────────────────────────
  console.log("6/6  Creando notificaciones...");
  const notifs = [
    { msg: "Bienvenido al sistema de gestión de lanzamientos aéreos.", user: admin.id },
    { msg: `Nueva solicitud de alta prioridad de ${solicitantes[0].name}.`, user: admin.id },
    { msg: "Solicitud sol-asignada-01 asignada a Base Bahía Blanca.", user: admin.id },
    { msg: "Solicitud sol-completada-01 entregada exitosamente.", user: admin.id },
    { msg: "Stock crítico: menos de 20 unidades de Vacunas en Bahía Blanca.", user: admin.id },
    { msg: `Bienvenido ${solicitantes[0].name}, tu cuenta está activa.`, user: solicitantes[0].id },
    { msg: `Bienvenido ${solicitantes[1].name}, tu cuenta está activa.`, user: solicitantes[1].id },
    { msg: `Tienes una nueva solicitud asignada.`, user: remitentes.length > 0 ? remitentes[0].id : admin.id },
  ];
  await prisma.notificacion.createMany({
    data: notifs.map(n => ({ mensaje: n.msg, id_usuario: n.user })),
    skipDuplicates: true,
  });
  console.log(`   ${notifs.length} notificaciones`);

  console.log("\n=== Seed completado exitosamente ===");
  console.log(`   ${users.length} usuarios, ${bases.length} bases, ${productos.length} productos`);
  console.log(`   ${solicitudes.length} solicitudes, ${notifs.length} notificaciones`);
}

main()
  .catch((e) => {
    console.error("\nERROR durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
