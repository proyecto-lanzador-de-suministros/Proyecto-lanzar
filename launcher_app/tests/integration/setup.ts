import { vi } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

const testUrl = process.env.DATABASE_URL_TEST;
if (testUrl) {
  const adapter = new PrismaPg({ connectionString: testUrl });
  const testClient = new PrismaClient({ adapter });
  (globalThis as any).__TEST_PRISMA_CLIENT = testClient;
}
