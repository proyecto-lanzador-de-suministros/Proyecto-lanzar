// Cliente Prisma singleton compartido por todos los adaptadores de base de datos del proyecto.
import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
