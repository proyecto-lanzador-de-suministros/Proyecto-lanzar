import { ForManagingTestData } from "../../domain/ports/forManagingTestData.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import { currentUser } from "@clerk/nextjs/server";

export class PrismaTestDataRepository implements ForManagingTestData {
  async ensureSolicitanteExists(usuarioId: string): Promise<void> {
    const existing = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
    });
    if (existing?.rol === "SOLICITANTE") return;

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "solicitante@correo.com";
    const nombre = clerkUser?.fullName ?? "Usuario Solicitante";

    await prisma.usuario.upsert({
      where: { id_usuario: usuarioId },
      update: { rol: "SOLICITANTE", nombre, email },
      create: {
        id_usuario: usuarioId,
        nombre,
        email,
        rol: "SOLICITANTE",
        estado_cuenta: "APROBADA",
      },
    });
  }

  async ensureTestDataSeeded(): Promise<string> {
    const baseCount = await prisma.base.count();
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
            rol: "REMITENTE",
            estado_cuenta: "APROBADA",
          },
        });

        const base = await tx.base.create({
          data: {
            id_base: "base-default-location",
            nombre: "Base Central Bahía Blanca",
            posicion_base: JSON.stringify({ lat: -38.7183, lng: -62.2663 }),
            direccion: "Bahía Blanca, Argentina",
          },
        });

        await tx.usuario.update({
          where: { id_usuario: baseUserId },
          data: { id_base: base.id_base },
        });

        defaultBaseId = base.id_base;
      });
    } else {
      const base = await prisma.base.findFirst();
      defaultBaseId = base!.id_base;
    }

    if (productCount === 0) {
      await prisma.$transaction(async (tx) => {
        const prod1 = await tx.producto.create({
          data: {
            nombre: "Vacunas y Suero Fisiológico",
            descripcion: "Kit térmico con vacunas esenciales y suero.",
            peso_kg: 4.5,
            categoria: "Suministros Médicos",
          },
        });

        const prod2 = await tx.producto.create({
          data: {
            nombre: "Botiquín de Primeros Auxilios",
            descripcion: "Gasas, desinfectante, bandages y medicamentos básicos.",
            peso_kg: 1.5,
            categoria: "Suministros Médicos",
          },
        });

        const prod3 = await tx.producto.create({
          data: {
            nombre: "Raciones de Alimento Deshidratado",
            descripcion: "Comida de emergencia alta en calorías.",
            peso_kg: 2.0,
            categoria: "Suministros Médicos",
          },
        });

        await tx.stock_Base.createMany({
          data: [
            { id_base: defaultBaseId, id_producto: prod1.id_producto, cantidad_disponible: 100 },
            { id_base: defaultBaseId, id_producto: prod2.id_producto, cantidad_disponible: 150 },
            { id_base: defaultBaseId, id_producto: prod3.id_producto, cantidad_disponible: 200 },
          ],
        });
      });
    }

    return defaultBaseId;
  }
}
