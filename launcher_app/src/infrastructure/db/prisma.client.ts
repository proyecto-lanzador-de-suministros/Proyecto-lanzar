import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  __TEST_PRISMA_CLIENT?: PrismaClient;
};

const testClient = globalForPrisma.__TEST_PRISMA_CLIENT;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL no está definida. Verificá que exista el archivo .env en la raíz del proyecto (launcher_app/.env)"
  );
}

if (testClient) {
  globalForPrisma.prisma ??= testClient;
} else {
  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { Pool } = await import("@neondatabase/serverless");
  const adapter = new PrismaNeon({ connectionString: databaseUrl });
  globalForPrisma.prisma ??= new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
