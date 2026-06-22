# Auditoría del Proyecto "Lanzar Suministros"

**Fecha:** 2026-06-21
**Alcance:** Documentación vs. implementación real, calidad arquitectónica, brechas y recomendaciones.

---

## Resumen Ejecutivo

| Dimensión | Estado |
|-----------|--------|
| Arquitectura documentada | ✅ Monolito Modular + Hexagonal |
| Arquitectura implementada | ✅ Consistente con lo documentado |
| API REST documentada (OpenAPI) | 12 endpoints |
| API REST implementada | 9 endpoints (75%) |
| Server Actions (no documentadas) | 31 funciones |
| Módulos con hexagonal completo | 8/8 |
| Modelo de datos documentado | 9 tablas en ER / relacional |
| Modelo de datos real (Prisma) | 13 modelos |
| Tests | 47 archivos (29 unitarios + 18 integración) |
| Sistema de errores de dominio | ✅ Implementado (14 códigos) |
| Máquina de estados | ✅ Documentada e implementada consistentemente |

---

## 1. Arquitectura

### 1.1 Estilo Arquitectónico

- **Documentado (ADR-001):** Monolito Modular + Hexagonal (Ports & Adapters)
- **Implementado:** Next.js 16.2.6 como framework full-stack con módulos separados en `src/modules/`
- **Verificación:** ✅ Consistente. El proyecto respeta la estructura documentada:

```
src/modules/<modulo>/
├── domain/
│   ├── entities/       → Reglas de negocio puras
│   ├── ports/          → Interfaces (puertos)
│   └── use-cases/      → Casos de uso
└── infrastructure/
    └── adapters/       → Implementaciones concretas
```

### 1.2 Módulos: Documentación vs. Realidad

| Módulo | Documentado | Implementado | Estructura hexagonal completa | Observaciones |
|--------|------------|--------------|-------------------------------|---------------|
| `solicitudes` | ✅ (CU-08 a CU-16, CU-19, CU-20) | ✅ 17 use-cases, 2 entidades, 2 ports, 2 adapters | ✅ Completo | Núcleo más desarrollado |
| `usuarios` | ✅ (CU-01 a CU-05) | ✅ 9 use-cases, 1 entidad, 1 port, 1 adapter | ✅ Completo | |
| `stock` | ✅ (CU-17, CU-18) | ✅ 4 use-cases, 1 entidad, 3 ports, 3 adapters | ✅ Completo | Pipeline documentado existe |
| `trayectoria` | ✅ (ADR-007, Pipeline) | ✅ 1 use-case, 1 entidad, 2 ports, 2 adapters | ✅ Completo | |
| `auth` | ✅ (ADR-006) | ✅ 2 use-cases, 2 ports, 2 adapters | ✅ Completo | Entidad Sesion creada |
| `notificaciones` | ✅ (ADR-003) | ✅ 11 use-cases, 3 ports, 2 adapters | ✅ Completo | Entidad Notificacion creada |
| `historial` | ✅ (RNF16) | ✅ 1 use-case, 1 port, 1 adapter | ✅ Completo | Entidad RegistroHistorial creada |
| `reportes` | ❌ No documentado | ✅ 1 use-case, 1 port, 1 adapter | ✅ Completo | Entidad Reporte creada |
| `errors` | ❌ No documentado | ✅ 3 archivos domain | Solo domain/ | Sistema transversal, módulo ligero |

**Brecha detectada (resuelta):** Los módulos `auth`, `notificaciones`, `historial` y `reportes` ya cuentan con entidades de dominio (`Sesion`, `Notificacion`, `RegistroHistorial`, `Reporte`). Todos los módulos tienen ahora estructura hexagonal completa.

---

## 2. Documentación de la API (OpenAPI)

### 2.1 Contrato REST (`api.yaml`)

| Endpoint | Método | Documentado | Implementado | ¿Dónde? | Estado |
|----------|--------|------------|--------------|---------|--------|
| `/usuarios` | GET | ✅ | ✅ | `app/api/usuarios/route.ts` | ✅ Implementado |
| `/solicitudes` | POST | ✅ | ✅ | `app/api/solicitudes/route.ts` | ✅ |
| `/solicitudes` | GET | ✅ | ✅ | `app/api/solicitudes/route.ts` | ✅ |
| `/solicitudes/{id}` | GET | ✅ | ✅ | `app/api/solicitudes/[id]/route.ts` | ✅ |
| `/solicitudes/{id}/estado` | PATCH | ✅ | ✅ | `app/api/solicitudes/[id]/estado/route.ts` | ✅ |
| `/solicitudes/{id}/historial` | GET | ✅ | ✅ | `app/api/solicitudes/[id]/historial/route.ts` | ✅ |
| `/bases/{id}/stock` | GET | ✅ | ✅ | `app/api/bases/[id]/stock/route.ts` | ✅ |
| `/bases/{id}/stock` | PUT | ✅ | ✅ | `app/api/bases/[id]/stock/route.ts` | ✅ |
| `/vuelos` | POST | ✅ | ❌ | No existe | ❌ No implementado |
| `/vuelos` | GET | ✅ | ❌ | No existe | ❌ No implementado |
| `/vuelos/{id}/contenedores` | POST | ✅ | ❌ | No existe | ❌ No implementado |

**Totales:** 11 documentados → 9 implementados como REST (82%). Adicionalmente existen 4 endpoints no documentados en OpenAPI: `/envios`, `/envios/{id}/contenedores`, `/admin/solicitudes`, `/auth/login`.

### 2.2 Server Actions (no documentadas en OpenAPI)

| Archivo | Funciones | Naturaleza |
|---------|-----------|------------|
| `solicitudes.actions.ts` | 15 | Mutaciones + consultas |
| `stock.actions.ts` | 5 | Mutaciones + consultas |
| `usuarios.actions.ts` | 4 | Mutaciones + consultas |
| `reportes.actions.ts` | 2 | Consultas |
| `remitentes.actions.ts` | 2 | Mutación + consulta |
| `notificaciones.actions.ts` | 2 | Consultas |
| `auditoria.actions.ts` | 1 | Consulta |

**Total:** 31 acciones — ninguna documentada en `api.yaml`.

### 2.3 Análisis de Brecha

> **El 25% del contrato REST documentado no está implementado (3 endpoints de `/vuelos`).**
> La mayoría de la funcionalidad vive en Server Actions, que son invisibles en la especificación OpenAPI.
> 9 de las 31 Server Actions son consultas GET que deberían ser REST endpoints según el contrato.
> Adicionalmente, hay 4 endpoints REST implementados que no están en `api.yaml`.

---

## 3. Modelo de Datos

### 3.1 Comparación ER / Relacional / Prisma

| Entidad | Diagrama ER | Modelo Relacional | Prisma (`schema.prisma`) |
|---------|------------|-------------------|--------------------------|
| Usuario | ✅ | ✅ | ✅ (más Solic./Remit./Admin.) |
| Base | ✅ | ✅ | ✅ (con TODO: migrar Stock_Base.id_remitente → Base) |
| Solicitud | ✅ | ✅ | ✅ |
| Envio | ✅ | ✅ | ✅ (reemplaza Vuelo + Lanzamiento anteriores) |
| Contenedor | ✅ | ✅ | ✅ |
| Producto | ✅ | ✅ | ✅ (renombrado) |
| StockBase | ✅ | ✅ | ✅ (Stock_Base) |
| DetalleSolicitud | ✅ | ✅ | ✅ (Detalle_Solicitud) |
| HistorialEstado | ✅ | ✅ | ✅ (Historial_Estado) |
| Notificacion | ✅ | ✅ | ✅ |
| — | — | — | **Solicitante** (extra) |
| — | — | — | **Remitente** (extra) |
| — | — | — | **Administrador** (extra) |
| — | — | — | **Historial_Stock** (extra) |

**Brecha detectada:**
- Prisma tiene **13 modelos** vs. 9 en el diagrama ER documentado → la documentación no fue actualizada tras las decisiones de implementación
- El modelo relacional y el ER están desactualizados respecto al schema real
- `Stock_Base` aún apunta a `Remitente` en vez de a `Base` (inconsistencia con el ER)

---

## 4. Máquina de Estados de Solicitud

### 4.1 Consistencia

| Aspecto | Documentado (last-chat.md, CU-08 a CU-20) | Implementado | Coinciden |
|---------|-------------------------------------------|--------------|-----------|
| Estados canónicos | 11 | 11 | ✅ |
| Transiciones definidas | 16 | 16 | ✅ |
| Estados terminales | 4 (Completada, Cancelada, Rechazada, Anulada) | 4 | ✅ |
| Quién ejecuta cada transición | Documentado | Implementado | ✅ |

**Verificación:** La máquina de estados está documentada con precisión en `last-chat.md` y coincide con la implementación en `Solicitud.ts` y los casos de uso.

---

## 5. Sistema de Errores

| Componente | Documentado | Implementado | Estado |
|-----------|------------|--------------|--------|
| `DomainError` base | ❌ No documentado | ✅ `src/modules/errors/domain/DomainError.ts` | No documentado |
| `errorCodeToStatus` | ❌ No documentado | ✅ 14 códigos mapeados | No documentado |
| `factories` | ❌ No documentado | ✅ 14 factories | No documentado |
| `handleDomainError` | ❌ No documentado | ✅ `src/infrastructure/errors/handleDomainError.ts` | No documentado |

**Brecha:** El sistema completo de errores de dominio (14 códigos, factories, handler HTTP) no está documentado en ningún ADR ni en la documentación técnica. Solo se menciona en `reporte.md` como plan de implementación.

---

## 6. Decisiones Arquitectónicas (ADRs)

| ADR | Título | Estado | Reflejado en código |
|-----|--------|--------|---------------------|
| ADR-001 | Estilo arquitectónico | Aceptada | ✅ Monolito Modular + Hexagonal |
| ADR-002 | PostgreSQL + PostGIS | Aceptada | ✅ Prisma + Neon (PostgreSQL) |
| ADR-003 | Cola asíncrona (BullMQ + Redis) | Aceptada | ⚠️ No hay evidencia de BullMQ en package.json ni imports |
| ADR-004 | PaaS + CDN (Vercel/Render) | Aceptada | ✅ Next.js preparado para Vercel |
| ADR-005 | Caché Redis (TTL 7min) | Aceptada | ⚠️ No hay evidencia de Redis client en package.json |
| ADR-006 | Clerk (IdP externo) | Aceptada | ✅ Clerk SDKs instalados y en uso |
| ADR-007 | Cálculo de trayectoria síncrono | Aceptada | ✅ TrajectoryCalculatorAdapter existe |

**Brechas detectadas:**
- **ADR-003:** No se encontró BullMQ ni Redis en las dependencias. Las notificaciones están implementadas pero probablemente sin cola de mensajes real (podrían ser síncronas o vía otro mecanismo).
- **ADR-005:** No se encontró Redis client en las dependencias. No hay evidencia de capa de caché implementada.

---

## 7. Pruebas

| Tipo | Cantidad | Ubicación |
|------|----------|-----------|
| Tests unitarios (todos los módulos) | 29 | `tests/unit-test/` |
| Tests de integración | 18 | `tests/integration/` |
| **Total** | **47** | |

**Cobertura observada:** Los módulos `solicitudes`, `trayectoria`, `stock`, `usuarios`, `auth`, `notificaciones`, `historial` y `reportes` tienen tests unitarios. Hay cobertura en los 8 módulos.

---

## 8. Contenedor de DI (`container.ts`)

- **Existe:** ✅ `src/container.ts` (270 líneas)
- **Casos de uso inyectados:** 27
- **Módulos representados:** auth, usuarios, solicitudes, stock, historial, reportes, notificaciones, trayectoria
- **Módulo ausente:** Ninguno. `trayectoria` ya está conectado (importa `CalcularTrayectoria`, `TrajectoryCalculatorAdapter` y `OpenMeteoWeatherAdapter`).

**Brecha (resuelta):** El módulo `trayectoria` fue conectado al contenedor. Todos los módulos están inyectados.

---

## 9. Brechas por Severidad

### 🔴 Alta (bloqueante para producción)
| # | Brecha | Detalle | Impacto |
|---|--------|---------|---------|
| 1 | Contrato REST parcialmente implementado | 3/12 endpoints faltan (vuelos) | La API pública no cubre vuelos |
| 2 | Server Actions no documentadas | 31 funciones sin especificación | Imposible integrar desde terceros |
| 3 | ADR-003/ADR-005 sin evidencia | BullMQ/Redis no están en las dependencias | Notificaciones pueden no ser asíncronas; no hay caché |
| 4 | Documentación de datos obsoleta | ER y modelo relacional no reflejan el schema real de 13 tablas | Confusión en el equipo |

### 🟡 Media
| # | Brecha | Detalle |
|---|--------|---------|
| 5 | Sistema de errores no documentado | 14 códigos, factories, handler no aparecen en ADRs |
| 6 | Arquitectura real mixta REST + Server Actions | Next.js difumina la frontera documentada |

### 🟢 Baja
| # | Brecha | Detalle |
|---|--------|---------|
| 7 | La documentación de `reporte.md` no está integrada al `index.md` | Documento de plan de implementación suelto |
| 8 | Archivos `api.yaml` y `reporte.md` mencionan `/vuelos` que no existe en código | Contrato no implementable |
| 9 | Contrato OpenAPI desactualizado | Faltan endpoints `/envios`, `/admin/solicitudes`, `/auth/login` y sobran `/vuelos` |

---

## 10. Recomendaciones

### Prioridad 1 — Inmediata
1. **Sincronizar contrato OpenAPI:** Actualizar `api.yaml` para reflejar los 9 endpoints REST implementados y agregar los 4 no documentados (`/envios`, `/admin/solicitudes`, `/auth/login`). Decidir si los endpoints de `/vuelos` se implementan o se eliminan del contrato.
2. **Documentar el sistema de errores:** Agregar un ADR o sección a la documentación con los 14 códigos de error, factories y handler HTTP.
3. **Actualizar modelo de datos documentado:** Sincronizar Diagrama ER y Modelo Relacional con las 13 tablas de Prisma.

### Prioridad 2 — Corto plazo
4. **Evaluar si Redis/BullMQ están planificados:** Si ADR-003 y ADR-005 son decisiones vigentes, agregar dependencias e implementar. Si se reconsideraron, actualizar los ADRs.
5. **Integrar `reporte.md` a la documentación principal:** Reflejar el plan de implementación y el estado de fases en `index.md`.
6. **Migrar `Stock_Base` a `Base`:** Actualizar `Stock_Base.id_remitente` → `Stock_Base.id_base` para ser consistente con el ER.

### Prioridad 3 — Mediano plazo
7. **Unificar la interfaz de integración:** Definir criterios claros de qué va como REST vs. Server Action (ej. consultas GET → REST, mutaciones con revalidatePath → Server Actions).
8. **Implementar endpoints de `/vuelos` si son necesarios,** o eliminarlos del contrato OpenAPI.

---

## 11. Métricas Finales

| Indicador | Valor |
|-----------|-------|
| Archivos de documentación | 15 |
| ADRs definidos | 7 |
| Endpoints REST documentados | 12 |
| Endpoints REST implementados | 9 (75%) |
| Endpoints REST no documentados (extra) | 4 |
| Server Actions implementadas | 31 |
| Módulos con hexagonal completo | 8/8 (100%) |
| Modelos documentados (ER) | 9 |
| Modelos reales (Prisma) | 13 |
| Tests unitarios | 29 |
| Tests de integración | 18 |
| Casos de uso inyectados | 27 |
| Códigos de error de dominio | 14 |
| Estados de máquina de solicitudes | 11 |
