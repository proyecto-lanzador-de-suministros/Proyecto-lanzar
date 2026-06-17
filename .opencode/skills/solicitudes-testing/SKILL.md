---
name: solicitudes-testing
description: Genera tests con Vitest para el módulo src/modules/solicitudes (arquitectura hexagonal) — repositorios Prisma (adaptadores), casos de uso (use-cases) y entidades de dominio. Usar siempre que el usuario pida "hacer tests", "testear", "escribir tests para CU-XX", "test para el repositorio/adaptador/entidad de solicitudes", o mencione un caso de uso de solicitudes (CrearSolicitud, ControlarSolicitud, AsignarSolicitud, CancelarSolicitud, etc.) junto con la palabra test/spec. También aplica si el usuario pide corregir o actualizar tests existentes en este módulo que estén desincronizados con la implementación real.
---

# Tests del módulo de Solicitudes

Esta skill encapsula las convenciones ya validadas para testear el módulo `src/modules/solicitudes` (arquitectura hexagonal: domain/ports, domain/entities, domain/use-cases, infrastructure/adapters). El objetivo es que cualquier test generado por este flujo no necesite corrección manual después.

## Regla de oro: leer antes de escribir

**Nunca generes un test a partir de memoria o de "cómo suelen ser estos casos de uso".** Antes de escribir cualquier test:

1. Lee el archivo del caso de uso / repositorio / entidad real con `view`.
2. Lee la firma completa del constructor — cuántas dependencias recibe y de qué tipo (`ports`).
3. Lee el `input`/output (interfaces `XxxInput` / `XxxOutput`) tal cual están definidas, no como "deberían" estar.
4. Si el caso de uso delega en otro caso de uso (ej. `CrearSolicitud` delega en `ControlarSolicitud`), lee también ese segundo archivo para saber qué mockear y con qué forma.
5. Si hay dudas sobre un tipo (ej. si `coordinates` es tupla o array), preguntá antes de asumir.

Saltarse este paso es la causa más común de tests que después hay que corregir (ver historial: tests que asumían un repo Mock que ya no se usa, o un DTO con campos que no existen en el use-case real).

## Paso 0: identificar qué se está testeando

Mirá el path o el nombre que te da el usuario y elegí la referencia correspondiente:

| El usuario pide testear... | Leer referencia |
|---|---|
| Un adaptador `infrastructure/adapters/Prisma*Repository.ts` | `references/repositorio-prisma.md` |
| Un caso de uso `domain/use-cases/*.usecase.ts` | `references/casos-de-uso.md` |
| Una entidad `domain/entities/*.ts` | `references/entidades-dominio.md` |
| No especifica / "testeá todo CU-XX" | Leé las tres referencias relevantes a ese caso de uso (el use-case, su repo, y la entidad que manipula) |

No hace falta cargar las tres referencias siempre — solo la(s) que correspondan a lo que se va a testear.

## Convenciones transversales (aplican siempre)

Estas reglas valen para los tres tipos de test, independientemente de la referencia que uses:

- **Nunca usar `MockSolicitudesRepository`.** Ese repositorio ya no se usa en el proyecto. Todo lo que necesite un `ForManagingSolicitudes` real se cubre mockeando `PrismaSolicitudesRepository` vía el mock de `@/src/infrastructure/db/prisma.client` (ver `references/repositorio-prisma.md`), o mockeando el puerto directamente con `vi.fn()` cuando estás testeando un caso de uso que solo necesita la interfaz (`ForManagingSolicitudes`), sin pasar por Prisma.
- **Dependencias de casos de uso que delegan en otros casos de uso se mockean, no se instancian.** Si `CrearSolicitud` recibe un `ControlarSolicitud` real en su constructor, en el test de `CrearSolicitud` se le pasa un objeto `{ ejecutar: vi.fn() }` casteado, nunca una instancia real de `ControlarSolicitud` (eso evita arrastrar las dependencias de stock, etc., y mantiene el test enfocado en una sola unidad).
- **`vi.mock(...)` siempre va con factory inline**, nunca referenciando variables externas (por el hoisting de Vitest). Si necesitás acceder a los mocks desde los tests, importá el módulo real mockeado y castealo:
  ```ts
  import { prisma } from "@/src/infrastructure/db/prisma.client";
  vi.mock("@/src/infrastructure/db/prisma.client", () => ({ prisma: { /* ... */ } }));
  const prismaMock = prisma as unknown as { /* forma tipada */ };
  ```
- **Usar los enums reales, nunca strings literales.** `PrioridadSolicitud.Media`, no `"media"`. `EstadoSolicitud.Creada`, no `"creada"`. Si no sabés los valores del enum, leelo en `domain/entities/Solicitud.ts` antes de escribir el test.
- **Respetar la forma exacta de `PuntoGeometria`**: `{ type: "Point", coordinates: [number, number] }`, tupla de 2, con `type: "Point" as const` cuando TypeScript lo requiera por inferencia de literal.
- **`vi.clearAllMocks()` en `beforeEach`** para que cada test parta de mocks limpios.
- **Verificar el resultado correcto según el output real**, no asumir que el caso de uso devuelve la entidad pelada. Muchos casos de uso devuelven `{ solicitud, asignada, stockFaltante? }` u outputs similares — siempre confirmá la forma real del output antes de escribir los `expect`.

## Paso 1: confirmar ubicación de archivos de test

Los tests van junto al módulo, normalmente en una carpeta `tests/` o como archivo hermano `*.test.ts`. Si no es obvio dónde poner el archivo nuevo, mirá dónde están los tests existentes del mismo módulo (`view` sobre `src/modules/solicitudes`) y seguí esa misma convención de carpeta/nombre.

## Paso 2: generar el test

Seguí la referencia correspondiente del Paso 0. Cada referencia tiene una plantilla completa y explica las variantes según lo que el caso de uso/entidad necesite.

## Paso 3: revisar contra la checklist final

Antes de entregar el test, repasá esta lista (está pensada para detectar exactamente los errores que ya se cometieron antes en este proyecto):

- [ ] ¿El `vi.mock` de Prisma está en factory inline, sin referenciar variables externas?
- [ ] ¿Importé `prisma` real y lo casteé a `prismaMock`, en vez de inventar una variable suelta?
- [ ] ¿El path del mock coincide carácter por carácter con el import real del archivo bajo test? (revisar con `view` el archivo real, no asumir)
- [ ] ¿Usé enums (`PrioridadSolicitud.X`, `EstadoSolicitud.X`) en vez de strings?
- [ ] ¿El constructor del caso de uso que estoy testeando recibe todas las dependencias que pide, mockeadas con la forma correcta?
- [ ] ¿Mockeé los casos de uso delegados en vez de instanciarlos reales?
- [ ] Si el caso de uso devuelve un objeto compuesto (`{ solicitud, asignada, ... }`), ¿estoy accediendo a `resultado.solicitud.x`, no a `resultado.x` directamente?
- [ ] ¿Confirmé la forma de `PuntoGeometria` y cualquier otro tipo de dominio leyendo el archivo real, no de memoria?
- [ ] ¿NO usé `MockSolicitudesRepository` en ningún lado?

Si alguna respuesta es "no" o "no estoy seguro", volvé a leer el archivo fuente correspondiente antes de entregar.
