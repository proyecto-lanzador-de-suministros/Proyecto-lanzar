# Tests de casos de uso (use-cases)

Aplica a archivos como `domain/use-cases/CrearSolicitud.usecase.ts`, `ControlarSolicitud.usecase.ts`, y cualquier otro `*.usecase.ts` del módulo.

## Antes de escribir el test

1. Leé el archivo completo del caso de uso. Anotá:
   - **Constructor**: cuántos parámetros recibe y de qué tipo (puertos como `ForManagingSolicitudes`, `ForManagingStock`, u otros casos de uso como `ControlarSolicitud`).
   - **Input**: la interfaz `XxxInput` exacta — campos obligatorios vs. opcionales (`?`), y sus tipos (enums, tuplas, fechas).
   - **Output**: la interfaz `XxxOutput` exacta. Muchos casos de uso NO devuelven la entidad directamente, sino un objeto compuesto (`{ solicitud, asignada, stockFaltante? }`). Los `expect` del test tienen que apuntar a la forma real, no a `resultado.estado` si en realidad es `resultado.solicitud.estado`.
   - **Delegación**: si el caso de uso llama a `ejecutar()` de otro caso de uso internamente, ese otro caso de uso se mockea — nunca se instancia real en este test. Si lo instanciás real, estás testeando dos unidades a la vez y heredás las dependencias del segundo (ej. `ForManagingStock`), lo cual generalmente no es la intención de un test de caso de uso aislado.

2. Si el caso de uso necesita un repositorio (`ForManagingSolicitudes`), la opción correcta en este proyecto es usar `PrismaSolicitudesRepository` con el mock de Prisma (ver `references/repositorio-prisma.md` para el patrón de mock) — **no** `MockSolicitudesRepository`, que ya no se usa en el proyecto.

## Plantilla base (caso de uso que delega en otro caso de uso)

Ejemplo con `CrearSolicitud`, que recibe un repo (vía Prisma mockeado) y delega en `ControlarSolicitud` (mockeado como objeto, no instanciado):

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CrearSolicitud } from "../domain/use-cases/CrearSolicitud.usecase";
import { ControlarSolicitud } from "../domain/use-cases/ControlarSolicitud.usecase";
import { PrismaSolicitudesRepository } from "../infrastructure/adapters/PrismaSolicitudRepository";
import { PrioridadSolicitud, EstadoSolicitud } from "../domain/entities/Solicitud";
import { prisma } from "@/src/infrastructure/db/prisma.client";

vi.mock("@/src/infrastructure/db/prisma.client", () => ({
  prisma: {
    solicitud: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  solicitud: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

describe("CrearSolicitud", () => {
  let repo: PrismaSolicitudesRepository;
  let controlarSolicitudMock: { ejecutar: ReturnType<typeof vi.fn> };
  let useCase: CrearSolicitud;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaSolicitudesRepository();
    controlarSolicitudMock = { ejecutar: vi.fn() };
    useCase = new CrearSolicitud(
      repo,
      controlarSolicitudMock as unknown as ControlarSolicitud,
    );
  });

  const inputBase = {
    id_usuario: "user-1",
    prioridad: PrioridadSolicitud.Media,
    ubicacion_destino: {
      type: "Point" as const,
      coordinates: [-58.3816, -34.6037] as [number, number],
    },
    productos: [{ productoId: "prod-001", cantidad: 2 }],
    fecha_estimada: new Date("2026-06-15"),
  };

  it("crea la solicitud en estado Creada antes de delegar el control de stock", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockImplementation(async (solicitud) => ({
      solicitud,
      asignada: true,
    }));

    const resultado = await useCase.ejecutar(inputBase);

    expect(resultado.solicitud.estado).toBe(EstadoSolicitud.Creada);
    expect(resultado.solicitud.id_solicitud).toBeDefined();
  });

  it("persiste la solicitud antes de delegar a ControlarSolicitud", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockImplementation(async (solicitud) => ({
      solicitud,
      asignada: true,
    }));

    await useCase.ejecutar(inputBase);

    expect(prismaMock.solicitud.create).toHaveBeenCalledOnce();
  });

  it("delega el control de stock a ControlarSolicitud con la solicitud creada", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockImplementation(async (solicitud) => ({
      solicitud,
      asignada: true,
    }));

    await useCase.ejecutar(inputBase);

    expect(controlarSolicitudMock.ejecutar).toHaveBeenCalledOnce();
    expect(controlarSolicitudMock.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({ id_usuario: "user-1" }),
    );
  });

  it("propaga el resultado de rechazo por falta de stock", async () => {
    prismaMock.solicitud.create.mockResolvedValue(undefined);
    controlarSolicitudMock.ejecutar.mockResolvedValue({
      solicitud: expect.anything(),
      asignada: false,
      stockFaltante: ["prod-001"],
    });

    const resultado = await useCase.ejecutar(inputBase);

    expect(resultado.asignada).toBe(false);
    expect(resultado.stockFaltante).toEqual(["prod-001"]);
  });
});
```

## Plantilla base (caso de uso "hoja", sin delegación a otro use-case)

Para casos de uso que solo dependen de puertos (repos), sin llamar a otro caso de uso — ej. algo como `ControlarSolicitud` en sí mismo, que depende de `ForManagingSolicitudes` y `ForManagingStock`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ControlarSolicitud } from "../domain/use-cases/ControlarSolicitud.usecase";
import { PrismaSolicitudesRepository } from "../infrastructure/adapters/PrismaSolicitudRepository";
import { Solicitud, PrioridadSolicitud } from "../domain/entities/Solicitud";
import type { ForManagingStock } from "@/src/modules/stock/domain/ports/forManagingStock.port";
import { prisma } from "@/src/infrastructure/db/prisma.client";

vi.mock("@/src/infrastructure/db/prisma.client", () => ({
  prisma: {
    solicitud: {
      update: vi.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as {
  solicitud: { update: ReturnType<typeof vi.fn> };
};

describe("ControlarSolicitud", () => {
  let repo: PrismaSolicitudesRepository;
  let stockMock: ForManagingStock;
  let useCase: ControlarSolicitud;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaSolicitudesRepository();
    stockMock = { verificarYReservar: vi.fn() } as unknown as ForManagingStock;
    useCase = new ControlarSolicitud(repo, stockMock);
  });

  function solicitudDePrueba(): Solicitud {
    return Solicitud.crear({
      id_solicitud: "sol-001",
      id_usuario: "usr-001",
      ubicacion_destino: { type: "Point", coordinates: [-62.3, -38.7] },
      prioridad: PrioridadSolicitud.Media,
      productos: [{ productoId: "prod-001", cantidad: 2 }],
    });
  }

  it("asigna la base cuando hay stock disponible", async () => {
    (stockMock.verificarYReservar as ReturnType<typeof vi.fn>).mockResolvedValue({
      disponible: true,
      id_base: "base-007",
    });
    prismaMock.solicitud.update.mockResolvedValue(undefined);

    const resultado = await useCase.ejecutar(solicitudDePrueba());

    expect(resultado.asignada).toBe(true);
    expect(prismaMock.solicitud.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id_remitente: "base-007" }),
      }),
    );
  });

  it("rechaza la solicitud cuando no hay stock suficiente", async () => {
    (stockMock.verificarYReservar as ReturnType<typeof vi.fn>).mockResolvedValue({
      disponible: false,
      productosFaltantes: ["prod-001"],
    });
    prismaMock.solicitud.update.mockResolvedValue(undefined);

    const resultado = await useCase.ejecutar(solicitudDePrueba());

    expect(resultado.asignada).toBe(false);
    expect(resultado.stockFaltante).toEqual(["prod-001"]);
  });
});
```

## Checklist específica de este tipo de test

- Confirmá SIEMPRE cuántos argumentos recibe el constructor — es el error más común al actualizar tests viejos (quedan armados para una sola dependencia cuando el caso de uso ahora pide dos).
- Si el caso de uso delega en otro `*.usecase.ts`, mockealo como `{ ejecutar: vi.fn() }` casteado, nunca lo instancies real.
- Si el caso de uso depende solo de puertos (no de otros casos de uso), mockeá el puerto directamente con un objeto `{ metodo: vi.fn() }` casteado al tipo del puerto — no hace falta pasar por Prisma si el puerto en cuestión no es `ForManagingSolicitudes` con Prisma de por medio (ej. `ForManagingStock` se mockea directo, no tiene adaptador Prisma en este contexto salvo que se indique lo contrario).
- Revisá el output real antes de escribir los `expect` — no asumas que es la entidad pelada.
- Un test por cada rama de negocio relevante (éxito, rechazo, casos con/sin campos opcionales) en vez de un solo test "feliz".
