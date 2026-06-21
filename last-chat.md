# Chat — 17 Jun 2026

## Revisión: `src/modules/solicitudes/` vs arquitectura hexagonal

Se revisó el módulo completo. Conclusión: **respeta la arquitectura en su mayoría**, con una violación y varios issues secundarios.

### Estructura (correcta)

```
solicitudes/
  domain/{entities,ports,use-cases}/
  infrastructure/adapters/
```

### Violación crítica 
!! DONE
- `domain/use-cases/tests/CrearSolicitud.test.ts:3` importa `MockSolicitudesRepository` desde `infrastructure/adapters/`. El test está dentro de `domain/` y genera una dependencia ilegal. Debería moverse fuera (ej. `src/modules/solicitudes/tests/`).

### Issues secundarios

- **5 archivos vacíos/incompletos**: `Paquete.ts`, `ConfirmarRecibida.usecase.ts`, `RegistrarEnPreparacion.usecase.ts`, `RegistrarEnCamino.usecase.ts`, `RegistrarLanzada.usecase.ts`, `RegistrarLista.usecase.ts`.
- **Inconsistencia en nombres de clase**: 5 use cases sin sufijo `UseCase` (`CancelarSolicitud`, `ConsultarSolicitud`, `ConsultarSolicitudesPendientes`, `ControlarSolicitud`, `CrearSolicitud`).
- **Idioma mezclado**: !!DONE `CambiarEstadoSolicitudUseCase.execute()` y `ObtenerSolicitudesUseCase.execute()` usan inglés en vez de `ejecutar()`.
- **Test roto**: !!DOING `CrearSolicitud.test.ts` pasa 1 argumento al constructor, pero requiere 2.

### Domain entity `Solicitud.ts` — métodos de negocio

Está bien que tenga métodos de negocio. Es un modelo rico (DDD) que encapsula sus invariantes: máquina de estados, validaciones de transición, reglas de cancelación/anulación. Los use cases orquestan llamando a esos métodos y coordinando con puertos externos.

### Diffs del último commit en `Solicitud.ts` (`c828f58`)

**Sacado**: `id` → `id_solicitud`, `solicitanteId` → `id_usuario`, `latDestino`/`lonDestino` → `ubicacion_destino: PuntoGeometria`, `remitenteId` → `id_base`, `fechaCreacion` → `fecha_solicitada`.

**Agregado**: import `PuntoGeometria`, prioridad `Urgente`, props `id_base`, `fecha_estimada`, `fecha_entrega`, getters correspondientes, método `confirmarEntrega()`.

**Modificado**: `asignar(remitenteId)` → `asignar(id_base)`, `estaFinalizada()` simplificado a `includes()` con array, comentarios actualizados.

---

## Revisión completa del módulo `solicitudes/` vs `Documentos/`

Se contrastó todo el código del módulo contra la documentación (CU-01 a CU-20, OpenAPI, ER, modelo relacional, ADRs, diagramas de secuencia).

### Problemas críticos

1. **Test `CrearSolicitud.test.ts` roto** (`domain/tests/CrearSolicitud.test.ts`)
   - Import incorrecto: `"../CrearSolicitud.usecase"` → debería ser `"../use-cases/CrearSolicitud.usecase"`
   - Firma incorrecta: el test pasa `{ id_base, id_usuario, prioridad, ubicacion_destino, fecha_entrega }`, pero `CrearSolicitud.ejecutar` espera `{ id_usuario, ubicacion_destino, prioridad, productos, fecha_estimada? }` — falta `productos` (requerido), sobra `id_base`, y el campo se llama `fecha_estimada` no `fecha_entrega`.
   - Constructor: el test instancia `new CrearSolicitud(repo)` pero el constructor pide `(repo, controlarSolicitud)`.

2. **`guardar()` en PrismaSolicitudesRepository hace `create` siempre, nunca `update`**
   - Si se llama `guardar()` sobre una solicitud existente (como hace `AsignarRemitenteUseCase` y `AnularSolicitudUseCase`), lanza error de PK duplicada. El `MockSolicitudesRepository` sí maneja ambos casos.
   - La versión anterior (`22fc63f`) usaba `upsert` y lo reemplazaron por `create` — esto rompe los flujos de tus compañeros.

3. **`mapToDomain` asigna `fechaActualizacion` desde `row.fecha_creacion`** (línea 109)
   - El schema Prisma no tiene columna `fecha_actualizacion`. Toda solicitud tendría `fechaActualizacion === fecha_creacion`.

4. **5 casos de uso vacíos**: `RegistrarEnPreparacion` (CU-12), `RegistrarLista` (CU-13), `RegistrarEnCamino` (CU-14), `RegistrarLanzada` (CU-15), `ConfirmarRecibida` (CU-16).

5. **`Paquete.ts` es solo un stub** (1 línea comentada).

### Discrepancias con documentación / API

| Concepto | Documentación / API | Código actual |
|---|---|---|
| Estado "Aprobada" | Existe como estado intermedio | No existe — va directo `Creada → Asignada` |
| "Listo" vs "Lista" | `Listo` | `Lista` |
| "En Preparacion" vs `EnPreparacion` | `"En Preparacion"` | `EnPreparacion = "En preparación"` |
| "En Camino" vs `EnCamino` | `"En Camino"` | `EnCamino = "En camino"` |
| Estados cancelables (CU-10) | `Creada, Aprobada, Asignada` | `Creada, Asignada` (falta Aprobada) |
| Entidad `Envio` | Existe en ER, relacional y secuencia | No existe en el módulo |
| Entidad `Contenedor` | Existe en ER | No existe |
| `fecha_estimada` en API | No aparece en el schema OpenAPI | Existe en la entidad |

### Issues menores

- `CambiarEstadoSolicitudUseCase` no valida la transición — debería usar la entidad (`solicitud.avanzarEstado()`) en vez de llamar directo al repo.
- `AsignarRemitenteUseCase` y `ControlarSolicitud` representan dos flujos de asignación (automático vs manual) que podrían solaparse.
- `MockSolicitudesRepository.actualizarEstado` ignora los `extras` (`motivoCancelacion`, `motivoAnulacion`, etc.).

---

## Revisión específica: `PrismaSolicitudRepository.ts` vs últimos cambios de compañeros

Contra los commits más recientes (`5e60b29`, `efcce34`, `e1f8b5b`):

### 1. `guardar()` rompe `AnularSolicitudUseCase` y `AsignarRemitenteUseCase`

El adaptador usa `prisma.solicitud.create` (línea 13), que falla si la solicitud ya existe. En el último commit (`e1f8b5b`), **Catalina** actualizó esos dos casos de uso para llamar a `guardar()` sobre solicitudes **existentes**:
- `AnularSolicitudUseCase:46` → `await this.solicitudRepository.guardar(solicitud)`
- `AsignarRemitenteUseCase:68` → `await this.solicitudRepository.guardar(solicitud)`

**Necesita volver a `upsert`** o implementar un upsert manual.

### 2. `guardar()` no persiste `Detalle_Solicitud`

La entidad tiene `productos[]`, y en `buscarPorId` se hace `include: { detalles: true }` para leerlos. Pero `guardar()` nunca persiste los detalles → los productos de la solicitud se pierden al guardar. Debería usar un `create` anidado con los `detalles`.

### 3. No se persiste `fecha_estimada`

El schema Prisma no tiene columna `fecha_estimada` ni `fecha_entrega` en `Solicitud`. Los campos existen en `SolicitudProps` de la entidad, pero el adaptador ni los lee ni los escribe.

### 4. `actualizarEstado` ignora `fecha_entrega`

Se recibe `extras.fecha_entrega` (línea 78 del adapter) pero nunca se incluye en el `prisma.solicitud.update`.

### 5. `fechaActualizacion` siempre mapeada desde `fecha_creacion` (línea 109)

No hay columna `fecha_actualizacion` en el schema Prisma. La entidad actualiza `fechaActualizacion` en cada transición (`transicionarA`), pero ese valor se pierde al persistir/recuperar.

### 6. `id_admin` no se mapea nunca

El schema Prisma tiene `id_admin` nullable en `Solicitud` (línea 118 del schema). El adaptador nunca lo lee ni escribe. La entidad de dominio no lo tiene — si se usa en el futuro, está desconectado.

### 7. `motivoCancelacion`/`motivoAnulacion` solo en `actualizarEstado`, no en `guardar`

Si se hace `guardar()` sobre una solicitud cancelada (que ya tiene `motivoCancelacion` seteado), ese dato se pierde porque `guardar()` no lo persiste.
----
Ya tengo todo el material de `solicitudes`: entidades y relaciones (ER), el ciclo de estados completo, los casos de uso CU-01 a CU-20, los dos pipelines relevantes (control de stock y cálculo de trayectoria, que disparan desde el ciclo de vida de la solicitud), el contrato `api.yaml`, y los ADRs.

Antes de redactar la referencia quiero marcarte algo que encontré, porque afecta cómo escribo la skill. Los ADRs (Entregable 4) describen una arquitectura con backend separado en Node.js/Express desplegado en Render o Railway, notificaciones vía Redis + BullMQ como cola de mensajes, y PostgreSQL con PostGIS — pero el AGENTS.md que me pasaste antes describe el repo real como un monolito Next.js con Prisma + Neon, notificaciones por Server-Sent Events y un Cron job de Vercel, sin Redis ni cola de mensajes. O sea: los ADRs documentan una decisión que en el código actual no se implementó así (al menos no según lo que vi).

Las reglas de dominio (estados de la solicitud, casos de uso, reglas de negocio, el contrato de API) son válidas igual, independientemente de esto — el problema es solo con la parte de infraestructura/comunicación interna que mencionan ADR-003 y ADR-007.

---

## Revisión: casos de uso del módulo `solicitudes/`

### 1. Estructura de carpetas

```
domain/
  entities/
    Solicitud.ts              ← entidad rica con lógica de negocio
    Paquete.ts                ← esqueleto (TODO)
  ports/
    forManagingSolicitudes.port.ts   ← interfaz del repositorio
  use-cases/
    CrearSolicitud.usecase.ts          (CU-08)
    ControlarSolicitud.usecase.ts      (CU-09)
    AsignarRemitente.usecase.ts        (CU-09 — asignación manual por admin)
    CancelarSolicitud.usecase.ts       (CU-10)
    AnularSolicitud.usecase.ts         (CU-11)
    CambiarEstadoSolicitud.usecase.ts  (genérico)
    ConsultarSolicitud.usecase.ts      (CU-20)
    ConsultarSolicitudesPendientes.usecase.ts (CU-19)
    ObtenerSolicitudes.usecase.ts      (listado global)
    ListarSolicitudesAdmin.usecase.ts  (listado admin)
    RegistrarEnPreparacion.usecase.ts  (TODO)
    RegistrarLista.usecase.ts          (TODO)
    RegistrarEnCamino.usecase.ts       (TODO)
    RegistrarLanzada.usecase.ts        (TODO)
    ConfirmarRecibida.usecase.ts       (TODO)
```

### 2. Contrato / Puerto (única interfaz que implementan todos)

**`domain/ports/forManagingSolicitudes.port.ts`** — 7 métodos que cualquier adaptador (Prisma, mock, etc.) debe implementar:

```ts
export interface ForManagingSolicitudes {
  guardar(solicitud: Solicitud): Promise<void>;
  buscarPorId(id: string): Promise<Solicitud | null>;
  listarPorSolicitante(userId: string): Promise<Solicitud[]>;
  listarTodas(estadoFiltro?: string): Promise<Solicitud[]>;
  listarPorBase(id_base: string): Promise<Solicitud[]>;
  listarPendientes(id_base: string): Promise<Solicitud[]>;
  actualizarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    extras?: { motivoCancelacion?, motivoAnulacion?, id_base?, fecha_entrega? }
  ): Promise<void>;
}
```

### 3. Tres ejemplos representativos

#### Simple: `CambiarEstadoSolicitud.usecase.ts` (10 líneas)

Solo delega al repositorio. Una sola dependencia, sin lógica de negocio extra:

```ts
export class CambiarEstadoSolicitudUseCase {
  constructor(private repository: ForManagingSolicitudes) {}
  async ejecutar(id: string, nuevoEstado: EstadoSolicitud): Promise<void> {
    await this.repository.actualizarEstado(id, nuevoEstado);
  }
}
```

#### Intermedio: `CrearSolicitud.usecase.ts` — orquesta dos pasos

Crea la entidad `Solicitud` (validando productos/cantidades en el constructor), persiste, y luego delega el control de stock a `ControlarSolicitud`:

```ts
// Crea la entidad → guarda → delega en CU-09
async ejecutar(input: CrearSolicitudInput): Promise<CrearSolicitudOutput> {
  const solicitud = Solicitud.crear({ ...input, id_solicitud: crypto.randomUUID() });
  await this.repo.guardar(solicitud);
  return this.controlarSolicitud.ejecutar(solicitud);
}
```

#### Complejo: `CancelarSolicitud.usecase.ts` (CU-10) — 4 pasos + 3 dependencias

1. Busca la solicitud por ID
2. Verifica permisos según rol (solicitante solo las propias)
3. La **entidad** valida que el estado permita cancelación (solo `Creada`/`Asignada`)
4. Libera stock reservado vía puerto de `stock` si tenía base
5. Persiste el nuevo estado con motivo

```ts
async ejecutar(input: CancelarSolicitudInput): Promise<Solicitud> {
  const solicitud = await this.repo.buscarPorId(input.id_solicitud);
  if (!solicitud) throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);
  if (input.rol === "solicitante" && solicitud.id_usuario !== input.id_usuario)
    throw new Error("No tenés permiso para cancelar esta solicitud.");
  solicitud.cancelar(input.motivo);           // ← validación en la entidad
  if (solicitud.id_base)
    await this.stock.liberarReserva({ id_base: solicitud.id_base, productos: solicitud.productos });
  await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado, { motivoCancelacion: input.motivo });
  return solicitud;
}
```

### 4. Resumen: simple vs complejo

| Complejidad | Caso | Dependencias | Pasos de negocio |
|---|---|---|---|
| **Simple** | `CambiarEstadoSolicitud` | 1 (repo) | 1 — solo persiste |
| **Simple** | `ListarSolicitudesAdmin` | 1 (repo) | 1 — solo lista |
| **Intermedio** | `CrearSolicitud` | 2 (repo + Controlar) | 3 — crear entidad, guardar, delegar stock |
| **Intermedio** | `ConsultarSolicitud` | 1 (repo) | 2 — buscar + verificar acceso por rol |
| **Complejo** | `CancelarSolicitud` | 2 (repo + stock) | 5 — buscar, permisos, validar estado, liberar stock, persistir |
| **Complejo** | `AsignarRemitente` | 4 (repo + usuarios + notifier + historial) | 6 — validar remitente, buscar solicitud, asignar, persistir, historial, notificar |
| **Complejo** | `AnularSolicitud` | 3 (repo + notifier + historial) | 5 — buscar, validar, persistir, historial, notificar |

**Patrón que se repite en todos:**
1. Clases sin herencia — cada `*.usecase.ts` es una clase independiente
2. Constructor recibe **puertos** (interfaces, no implementaciones concretas)
3. Un único método público `ejecutar(...)` que orquesta la lógica
4. La entidad `Solicitud` encapsula las validaciones de estado y transiciones (máquina de estados en `TRANSICIONES_VALIDAS`)
5. Los use cases complejos cruzan a otros módulos (`stock`, `usuarios`, `notificaciones`, `historial`) vía sus respectivos puertos
