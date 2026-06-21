import { vi } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma";

vi.mock("@clerk/nextjs/server", () => {
  const mockCreateUser = vi.fn().mockResolvedValue({ id: "clerk-test-id" });
  return {
    auth: vi.fn(),
    clerkClient: vi.fn().mockResolvedValue({
      users: { createUser: mockCreateUser },
    }),
  };
});

// Los tests de integración usan Testcontainers (Postgres plano), no Neon serverless.
// Reemplazamos el adapter del singleton para que apunte al contenedor de test.
vi.mock("@/src/infrastructure/db/prisma.client", async () => {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("@/src/generated/prisma");
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL_TEST!,
  });
  const prisma = new PrismaClient({ adapter });
  return { prisma };
});
