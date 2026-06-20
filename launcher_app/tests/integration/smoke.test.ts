// tests/integration/smoke.test.ts
import { describe, it, expect } from "vitest";
import { crearPrismaTest } from "./prisma-test-client";

describe("infraestructura de integración", () => {
  it("conecta a la DB de test", async () => {
    const prisma = crearPrismaTest(process.env.DATABASE_URL_TEST!);
    const result = await prisma.$queryRaw<[{ one: number }]>`SELECT 1 as one`;
    expect(result[0].one).toBe(1);
    await prisma.$disconnect();
  });
});
