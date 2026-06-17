# Tests de repositorios Prisma (adaptadores)

Aplica a archivos como `infrastructure/adapters/PrismaSolicitudRepository.ts` que implementan un puerto (`ForManagingSolicitudes`) usando Prisma.

## Antes de escribir el test

1. Leé el archivo del repositorio completo. Anotá:
   - El import exacto de `prisma` (ej. `@/src/infrastructure/db/prisma.client`) — el mock tiene que usar este mismo path, literal.
   - Cada método público y qué llamada de Prisma hace internamente (`create`, `upsert`, `findUnique`, `findMany`, `update`, etc.) — el mock de `prisma.solicitud` necesita un `vi.fn()` por cada método que el repo realmente usa, ni más ni menos.
   - Cómo mapea las columnas de la fila de Prisma a la entidad de dominio (nombres de campos pueden no coincidir 1 a 1, ej. `latitud_destino`/`longitud_destino` vs. `ubicacion_destino`).

## Plantilla base

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaSolicitudesRepository } from "../infrastructure/adapters/PrismaSolicitudRepository";
import {
  EstadoSolicitud,
  PrioridadSolicitud,
  Solicitud,
} from "../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client"; // ⚠️ debe coincidir EXACTO con el import real del repo

vi.mock("@/src/infrastructure/db/prisma.client", () => ({
  prisma: {
    solicitud: {
      create: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      // agregar solo los métodos que el repositorio real usa
    },
  },
}));

const prismaMock = prisma as unknown as {
  solicitud: {
    create: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

// ── Helpers ──────────────────────────────────────────────────────────

/** Fila mínima que devolvería Prisma (sin detalles) */
function rowBase() {
  return {
    id_solicitud: "sol-001",
    id_solicitante: "usr-001",
    id_remitente: null,
    latitud_destino: -38.7,
    longitud_destino: -62.3,
    prioridad: PrioridadSolicitud.Media,
    estado_actual: EstadoSolicitud.Creada,
    fecha_creacion: new Date("2026-01-01"),
    motivo_cancelacion: null,
    motivo_anulacion: null,
    detalles: [],
  };
}

describe("PrismaSolicitudesRepository", () => {
  let repo: PrismaSolicitudesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaSolicitudesRepository();
  });

  describe("nombreDelMetodo", () => {
    it("hace lo esperado", async () => {
      prismaMock.solicitud.findUnique.mockResolvedValue(rowBase());

      const resultado = await repo.buscarPorId("sol-001");

      expect(resultado).toBeInstanceOf(Solicitud);
    });
  });
});
```

## Checklist específica de este tipo de test

- El path en `vi.mock("...")` y en el `import { prisma } from "..."` debe ser **idéntico carácter por carácter** al import que usa el archivo del repositorio real. Si no coincide, el mock no intercepta nada y Vitest intentará usar el cliente real (o fallar silenciosamente).
- No agregues métodos al mock de `prisma.solicitud` que el repositorio no usa — mantiene el mock honesto y evita que el test "funcione" aunque el repo cambie de forma incompatible.
- Para verificar persistencia (`guardar`, `actualizarEstado`, etc.) preferí `expect(prismaMock.solicitud.create).toHaveBeenCalledWith(...)` con `expect.objectContaining({...})`, en vez de intentar releer con `findUnique` — es más directo y no depende de mantener sincronizados dos mocks distintos en el mismo test.
- Si el método del repo recibe `extras` opcionales (ej. `motivoCancelacion`, `id_base` en `actualizarEstado`), agregá un test por cada variante de extras, no solo el caso sin extras.
- Usá `expect.objectContaining` en vez de objetos exactos cuando el `data` que se le pasa a Prisma tiene campos generados (timestamps, UUIDs) que no controlás en el test.
