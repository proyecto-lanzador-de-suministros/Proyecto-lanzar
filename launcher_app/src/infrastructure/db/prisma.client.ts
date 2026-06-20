import { PrismaClient } from "../../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  __TEST_PRISMA_CLIENT?: PrismaClient;
};

const testClient = globalForPrisma.__TEST_PRISMA_CLIENT;

if (testClient) {
  globalForPrisma.prisma ??= testClient;
} else {
  const { PrismaNeon } = await import("@prisma/adapter-neon");
  const { Pool } = await import("@neondatabase/serverless");
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  globalForPrisma.prisma ??= new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
