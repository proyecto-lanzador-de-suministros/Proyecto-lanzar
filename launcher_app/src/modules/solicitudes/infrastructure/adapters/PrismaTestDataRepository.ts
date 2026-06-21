import { ForManagingTestData } from "../../domain/ports/forManagingTestData.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { currentUser } from "@clerk/nextjs/server";

export class PrismaTestDataRepository implements ForManagingTestData {
  async ensureSolicitanteExists(usuarioId: string): Promise<void> {
    const existing = await prisma.solicitante.findUnique({
      where: { id_solicitante: usuarioId },
    });
    if (existing) return;

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "solicitante@correo.com";
    const nombre = clerkUser?.fullName ?? "Usuario Solicitante";

    await prisma.$transaction(async (tx) => {
      let usuario = await tx.usuario.findUnique({
        where: { id_usuario: usuarioId },
      });
      if (!usuario) {
        usuario = await tx.usuario.create({
          data: {
            id_usuario: usuarioId,
            estado_cuenta: "APROBADA",
          },
        });
      }

      await tx.solicitante.create({
        data: {
          id_solicitante: usuarioId,
          nombre,
          contacto: email,
        },
      });
    });
  }

  async ensureTestDataSeeded(): Promise<string> {
    const baseCount = await prisma.remitente.count();
    const productCount = await prisma.producto.count();

    let defaultBaseId = "";

    if (baseCount === 0) {
      const baseUserId = "base-default-id";
      await prisma.$transaction(async (tx) => {
        await tx.usuario.upsert({
          where: { id_usuario: baseUserId },
          update: {},
          create: {
            id_usuario: baseUserId,
            estado_cuenta: "APROBADA",
          },
        });

        const base = await tx.remitente.upsert({
          where: { id_remitente: baseUserId },
          update: {},
          create: {
            id_remitente: baseUserId,
            nombre_base: "Base Central Bahía Blanca",
            latitud_base: -38.7183,
            longitud_base: -62.2663,
            capacidad_pista: "Grande",
          },
        });
        defaultBaseId = base.id_remitente;
      });
    } else {
      const base = await prisma.remitente.findFirst();
      defaultBaseId = base!.id_remitente;
    }

    if (productCount === 0) {
      await prisma.$transaction(async (tx) => {
        const prod1 = await tx.producto.create({
          data: {
            nombre: "Vacunas y Suero Fisiológico",
            descripcion: "Kit térmico con vacunas esenciales y suero.",
            peso_unitario: 4.5,
            categoria: "Suministros Médicos",
          },
        });

        const prod2 = await tx.producto.create({
          data: {
            nombre: "Botiquín de Primeros Auxilios",
            descripcion: "Gasas, desinfectante, bandages y medicamentos básicos.",
            peso_unitario: 1.5,
            categoria: "Suministros Médicos",
          },
        });

        const prod3 = await tx.producto.create({
          data: {
            nombre: "Raciones de Alimento Deshidratado",
            descripcion: "Comida de emergencia alta en calorías.",
            peso_unitario: 2.0,
            categoria: "Suministros Médicos",
          },
        });

        await tx.stock_Base.createMany({
          data: [
            { id_remitente: defaultBaseId, id_producto: prod1.id_producto, cantidad_disponible: 100 },
            { id_remitente: defaultBaseId, id_producto: prod2.id_producto, cantidad_disponible: 150 },
            { id_remitente: defaultBaseId, id_producto: prod3.id_producto, cantidad_disponible: 200 },
          ],
        });
      });
    }

    return defaultBaseId;
  }
}
