# Plan de implementación — Sistema de errores de dominio + fix de persistencia

**Módulo:** `solicitudes`
**Fecha:** 2026-06-20

---

## Fase 0 — Auditoría previa ✅ COMPLETADA

- [x] Auditoría de 29 `throw` → 13 códigos de error únicos.
- [x] Auditoría de usos de `guardar()` en use cases.
  - **Resultado:** 2 bugs confirmados (`AsignarRemitenteUseCase`, `AnularSolicitudUseCase`).

---

## Fase 1 — Infraestructura de errores de dominio ✅ COMPLETADA

- [x] `src/modules/errors/domain/DomainError.ts` — clase base con `code`, `message`, `details`.
- [x] `src/modules/errors/domain/errorCodeToStatus.ts` — mapeo de 14 códigos a HTTP.
- [x] `src/modules/errors/domain/factories.ts` — 14 factories (`Errores.*`).
- [x] `src/infrastructure/errors/handleDomainError.ts` — handler que devuelve `ErrorResponse` y loguea errores no manejados.

---

## Fase 2 — Migrar use cases a `DomainError` ✅ COMPLETADA

- [x] Entidad `Solicitud.ts`: 5 errores migrados.
- [x] 10 use cases: `SOLICITUD_NO_ENCONTRADA` migrado.
- [x] 8 use cases: `PERMISO_DENEGADO` migrado.
- [x] Resto: `REMITENTE_NO_ENCONTRADO`, `PRODUCTO_NO_ENCONTRADO`, `ROL_INVALIDO`, `CUENTA_NO_APROBADA`, `FALTA_ID_BASE`, `REMITENTE_NO_SELECCIONADO`.
- [x] Tests actualizados (152 tests pasan).

---

## Fase 3 — Fix de persistencia ✅ COMPLETADA

- [x] `actualizar()` agregado al port `ForManagingSolicitudes`.
- [x] Implementado en `PrismaSolicitudRepository` (persiste entidad completa).
- [x] `AsignarRemitenteUseCase`: `guardar` → `actualizar`.
- [x] `AnularSolicitudUseCase`: `guardar` → `actualizar`.
- [ ] Pendiente: `CambiarEstadoSolicitudUseCase` (dead code, no está en `container.ts` — decidir si se elimina o se arregla).

---

## Fase 4 - Conectar el handler en la capa de entrada ⏳ PENDIENTE

- [ ] Route handlers HTTP: cuando se definan los endpoints, usar `handleDomainError(error)` → `Response.json({ code, message, details }, { status: httpStatus })`.
- [ ] Server Actions: evaluar si conviene exponer `code`/`details` además de `error` para lógica condicional en el frontend.

---

## Fase 5 - Tests específicos de errores ⏳ PENDIENTE

- [ ] Tests unitarios: para los 14 códigos, assertar `instanceof DomainError` y `.code`.
- [ ] Tests de integración: verificar status HTTP contra `ERROR_CODE_TO_STATUS`.
- [ ] Test de regresión del bug de persistencia:

```
Crear solicitud → asignar remitente → assert: no unique constraint error.
Crear solicitud → anular → assert: estado en DB es Anulada.
```

---

## Fase 6 - Limpieza de consistencia ✅ COMPLETADA

- [x] `STOCK_INSUFICIENTE` se mantiene como flujo normal (Rechazada, sin throw).
- [x] Código muerto removido: factory `stockInsuficiente`, union type, y mapping HTTP 409.
- [x] `api.yaml` actualizado: respuesta 201 incluye `CrearSolicitudResponse` con `solicitud.estado`, `asignada` y `stockFaltante`.
- [x] Unificar redacción de mensajes entre use cases (ya resuelto por el uso de factories).

---

## Anexo A — Estructura de carpetas y ORM

### Directorio raíz del proyecto

```
Proyecto-lanzar/
├── Documentos/               # Documentación técnica (ADRs, api.yaml, reportes, diagramas)
├── launcher_app/             # Aplicación Next.js (monolito modular hexagonal)
│   ├── app/                  # Páginas y API routes de Next.js (App Router)
│   │   ├── admin/            # Vistas de administración
│   │   ├── remitente/        # Vistas de remitente
│   │   ├── solicitante/      # Vistas de solicitante
│   │   ├── api/              # API REST routes
│   │   │   ├── auth/login/   # GET → redirección a Clerk
│   │   │   ├── solicitudes/  # GET listar, GET /[id], PATCH /[id]/estado
│   │   │   └── admin/solicitudes/  # GET listar (admin)
│   │   │   └── bases/[id]/stock/   # (reservado, sin implementar)
│   │   └── components/       # Componentes compartidos de UI
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo de datos (PostgreSQL, 205 líneas)
│   │   └── migrations/       # Migraciones SQL generadas por Prisma
│   ├── src/
│   │   ├── modules/          # Módulos con arquitectura hexagonal
│   │   │   ├── auth/         # Autenticación (adaptador Clerk)
│   │   │   ├── solicitudes/  # Núcleo del dominio
│   │   │   ├── usuarios/     # Gestión de cuentas
│   │   │   ├── stock/        # Inventario
│   │   │   ├── historial/    # Trazabilidad de estados
│   │   │   ├── notificaciones/  # Notificaciones asíncronas
│   │   │   ├── trayectoria/  # Cálculo de caída libre
│   │   │   └── errors/       # Sistema de errores de dominio (DomainError)
│   │   ├── infrastructure/   # Adaptadores compartidos (db, maps, weather, errors)
│   │   ├── actions/          # Server Actions de Next.js
│   │   ├── container.ts      # Composition root (wiring de dependencias)
│   │   └── generated/        # Código generado (Prisma client)
│   └── tests/                # Tests de integración
│       └── integration/api/  # Tests HTTP sobre API routes
```

### Estructura interna de un módulo (hexagonal)

```
solicitudes/
├── domain/
│   ├── entities/             # Entidades de dominio (Solicitud.ts)
│   ├── ports/                # Puertos (interfaces)
│   │   └── forManagingSolicitudes.port.ts
│   └── use-cases/           # Casos de uso
│       ├── CrearSolicitud.usecase.ts
│       ├── CancelarSolicitud.usecase.ts
│       └── ...
├── infrastructure/
│   └── adapters/             # Implementaciones concretas
│       └── PrismaSolicitudRepository.ts
└── tests/                    # Tests unitarios del módulo
    ├── CrearSolicitud.test.ts
    └── ...
```

### ORM y base de datos

| Componente | Tecnología |
|-----------|-----------|
| Motor de BD | PostgreSQL (vía Prisma, con Neon serverless driver adapter) |
| ORM | Prisma 7 (`prisma-client-js`), con cliente generado en `src/generated/prisma/` |
| Conexión | `@prisma/adapter-neon` + ws (WebSocket) para serverless |
| Migraciones | Prisma Migrate (`prisma/schema.prisma` → migraciones SQL en `prisma/migrations/`) |
| Modelo | 15 tablas: Usuario, Solicitante, Remitente, Administrador, Solicitud, Detalle_Solicitud, Producto, Tipo, Stock_Base, Historial_Estado, Notificación, Vuelo, Contenedor, Zona_Exclusión, Trayectoria |

### Patrón de acceso a datos

- **Desde casos de uso**: vía puertos (interfaces). El adaptador `PrismaSolicitudRepository` implementa `ForManagingSolicitudes`. El dominio nunca importa Prisma.
- **Desde Server Actions**: acceso directo a `prisma` para consultas de solo lectura, reportes y operaciones que no justifican un caso de uso (ej. `prisma.remitente.findMany()` en `remitentes.actions.ts`).

---

## Anexo B — REST vs Server Actions

### Lo que la documentación define como REST

El archivo `api.yaml` (OpenAPI 3.0.3) define el **contrato REST oficial** del sistema. Sus endpoints son:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/usuarios` | GET | Listar usuarios |
| `/solicitudes` | POST | Crear solicitud |
| `/solicitudes` | GET | Listar solicitudes (filtrables) |
| `/solicitudes/{id}` | GET | Detalle de solicitud |
| `/solicitudes/{id}/estado` | PATCH | Actualizar estado |
| `/solicitudes/{id}/historial` | GET | Historial de cambios |
| `/bases/{id}/stock` | GET | Consultar stock de base |
| `/bases/{id}/stock` | PUT | Actualizar stock |
| `/vuelos` | POST | Programar vuelo |
| `/vuelos` | GET | Listar vuelos |
| `/vuelos/{id}/contenedores` | POST | Asignar contenedor a vuelo |

Además, los ADR-001 y ADR-004 describen el backend como una **API REST** que se comunica con una SPA React. La arquitectura elegida (Monolito Modular + Hexagonal) presupone un backend REST.

### Lo que está implementado como REST (API routes)

| Ruta real | Método | Contrato OpenAPI equivalente | Estado |
|-----------|--------|------------------------------|--------|
| `app/api/solicitudes/[id]/route.ts` | GET | `/solicitudes/{id}` GET | ✅ Implementado, usa `handleDomainError` |
| `app/api/solicitudes/[id]/estado/route.ts` | PATCH | `/solicitudes/{id}/estado` PATCH | ✅ Implementado, usa `handleDomainError` |
| `app/api/admin/solicitudes/route.ts` | GET | `/solicitudes` GET (variante admin) | ⚠️ Implementado, no usa DomainError |
| `app/api/auth/login/route.ts` | GET | — (login delegado a Clerk) | ✅ Implementado |
| `app/api/solicitudes/route.ts` | — | POST `/solicitudes`, GET `/solicitudes` | ❌ **Vací­o** (`export {}`) |
| `app/api/bases/[id]/stock/route.ts` | — | GET `/bases/{id}/stock`, PUT `/bases/{id}/stock` | ❌ **Vacío** (`export {}`) |

Faltan implementar como REST:
- `POST /solicitudes` (crear)
- `GET /solicitudes` (listar con filtros)
- `GET /solicitudes/{id}/historial`
- `GET /bases/{id}/stock`
- `PUT /bases/{id}/stock`
- Toda la sección de `vuelos` y `contenedores`
- `GET /usuarios`

### Lo que está implementado como Server Actions

Todas las operaciones de **mutación** y varias de **consulta** se implementan como Server Actions (`"use server"`) en `src/actions/`. Bajo el capó, Next.js genera un endpoint `POST` para cada action, pero no están documentadas en `api.yaml`.

| Archivo | Actions | Naturaleza |
|---------|---------|------------|
| `solicitudes.actions.ts` | `crearSolicitudAction`, `cancelarSolicitudAction`, `anularSolicitudAction`, `asignarRemitenteAction`, `registrarEnPreparacionAction`, `registrarListaAction`, `registrarEnCaminoAction`, `registrarLanzadaAction`, `confirmarRecibidaAction`, `consultarSolicitudAction`, `consultarSolicitudesPendientesAction`, `obtenerSolicitudesSolicitanteAction` | Mutaciones + consultas |
| `remitentes.actions.ts` | `listarRemitentesAction`, `actualizarBaseRemitenteAction` | Consulta + mutación |
| `stock.actions.ts` | `consultarStockBaseAction`, `actualizarStockAction`, `listarBasesParaStockAction`, `listarCatalogoProductosAction` | Consulta + mutación |
| `usuarios.actions.ts` | `aprobarCuentaAction`, `eliminarCuentaAction`, `obtenerRemitentesAprobadosAction` | Mutaciones + consulta |
| `notificaciones.actions.ts` | `obtenerNotificacionesAction`, `listarNotificacionesGlobalAction` | Consultas |
| `reportes.actions.ts` | `obtenerReporteSolicitudesAction`, `obtenerReporteStockAction` | Consultas |
| `auditoria.actions.ts` | `listarAuditoriaAction` | Consulta |

### Análisis de brecha

> **Lo que debería ser REST puro según `api.yaml`** y **no lo es** (solo existe como Server Action):
> - `POST /solicitudes` → `crearSolicitudAction`
> - `GET /solicitudes` (filtrable) → no implementado (ruta vacía)
> - `GET /solicitudes/{id}/historial` → no implementado (existe `consultarDetalleSolicitudAdminAction` como Server Action)
> - `GET /bases/{id}/stock` → `consultarStockBaseAction`
> - `PUT /bases/{id}/stock` → `actualizarStockAction`
> - `GET /usuarios` → `listarUsuariosUseCase` (solo disponible en `container.ts`, no expuesto como REST)

> **Lo que debería ser Server Action** (mutaciones que requieren `revalidatePath` o son llamadas directas desde formularios del lado cliente) y **está correctamente implementado como tal**:
> - `asignarRemitenteAction` — formulario admin
> - `anularSolicitudAction` — formulario admin/remitente
> - `registrarEnPreparacionAction`, `registrarListaAction`, `registrarEnCaminoAction`, `registrarLanzadaAction` — botones en panel remitente
> - `confirmarRecibidaAction` — botón en panel solicitante
> - `aprobarCuentaAction`, `eliminarCuentaAction` — botones en panel admin
> - `actualizarBaseRemitenteAction` — formulario admin
> - `actualizarStockAction` — formulario admin/remitente

> **Lo que debería ser REST** (consultas de solo lectura que podrían exponerse como API para consumo externo) pero **hoy es Server Action**:
> - `consultarSolicitudAction` — GET pública
> - `consultarSolicitudesPendientesAction` — GET con filtro
> - `obtenerSolicitudesSolicitanteAction` — GET del solicitante
> - `listarRemitentesAction` — GET admin
> - `consultarStockBaseAction` — GET base/stock
> - `obtenerReportesAction` — GET admin
> - `listarAuditoriaAction` — GET admin
> - `listarNotificacionesGlobalAction` — GET admin
> - `obtenerNotificacionesAction` — GET del usuario

### Resumen

| Categoría | Cantidad |
|-----------|----------|
| Endpoints REST documentados en `api.yaml` | 12 |
| Endpoints REST realmente implementados | 3 (\(\frac14\) del contrato) |
| Server Actions implementadas | ~22 |
| Endpoints REST documentados pero sin implementar (rutas vacías) | `POST /solicitudes`, `GET /solicitudes`, `GET /bases/{id}/stock`, `PUT /bases/{id}/stock` |
| Módulos completos sin implementar | `vuelos`, `contenedores` |
| Server Actions que deberían ser REST (solo consulta GET) | ~9 |

La implementación actual prioriza Server Actions para todo (mutaciones y consultas), desviándose del contrato REST definido en `api.yaml`. Las API routes REST existentes cubren solo los endpoints de consulta/detalle de solicitudes y cambio de estado. El resto de la funcionalidad (incluyendo creación de solicitudes, stock, reportes, auditoría) vive exclusivamente en Server Actions sin documentación OpenAPI.

---

## Resumen de estado

| Fase | Estado |
|------|--------|
| Fase 0 — Auditoría | ✅ |
| Fase 1 — Infraestructura | ✅ |
| Fase 2 — Migración | ✅ |
| Fase 3 — Fix persistencia | ✅ |
| Fase 4 — Conectar handler | ✅ (completado) |
| Fase 5 — Tests | ✅ (completado) |
| Fase 6 — Consistencia | ✅ (completado) |
