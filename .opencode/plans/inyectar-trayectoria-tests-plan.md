# Plan: Inyección del Módulo Trayectoria en Container + Tests

**Fecha:** 2026-06-21  
**Objetivo:** Hacer operativo el módulo `trayectoria` inyectándolo en `src/container.ts` y proveer cobertura de tests unitarios para su dominio y adaptadores.  
**Alcance:** Uso **interno** solo (inyectado para consumo de otros use-cases / Server Actions). No se expone REST/Action por ahora.

---

## 1. Inyección en container.ts

**Archivo a modificar:** `launcher_app/src/container.ts`

### Pasos exactos

1. **Agregar imports** debajo del último `import` existente:
   ```typescript
   import { CalcularTrayectoria } from "./modules/trayectoria/domain/use-cases/CalcularTrayectoria.usecase";
   import { TrajectoryCalculatorAdapter } from "./modules/trayectoria/infrastructure/adapters/TrajectoryCalculatorAdapter";
   import { OpenMeteoWeatherAdapter } from "./modules/trayectoria/infrastructure/adapters/openMeteoWeatherAdapter";
   ```

2. **Instanciar adaptadores** en la sección de infraestructura compartida (debajo de `notificationAdapter`):
   ```typescript
   const weatherAdapter = new OpenMeteoWeatherAdapter();
   const trajectoryCalculator = new TrajectoryCalculatorAdapter();
   ```

3. **Instanciar use-case** y exportarlo. Ubicarlo debajo de la sección de Reportes (o en su propia sección `// ── Trayectoria ──`):
   ```typescript
   export const calcularTrayectoriaUseCase = new CalcularTrayectoria(
     weatherAdapter,
     trajectoryCalculator,
   );
   ```

4. **Exportar instancias de adaptadores** (si otros módulos necesitan acceso directo, opcional):
   ```typescript
   export const weatherServiceAdapter = weatherAdapter;
   export const trajectoryCalculatorAdapter = trajectoryCalculator;
   ```

> **Verificación:** correr `npx tsc --noEmit` para asegurar que no hay errores de tipo tras inyectar.

---

## 2. Tests Unitarios del Dominio

**Convención:** archivos en `launcher_app/tests/unit-test/trayectoria/`.  
**Marco:** Vitest (`describe`, `it`, `expect`, `vi`, `beforeEach`).  
**Mock de puertos:** objetos con `vi.fn()` respetando las interfaces del dominio.

### 2.1. Trayectoria.entity.test.ts

- ✅ `Trayectoria.crear(...)` genera `created_at` como `Date`.
- ✅ `Trayectoria.reconstruir(...)` preserva **todos** los valores pasados (idempotencia).
- ✅ Getters exponen correctamente cada propiedad (`id_trayectoria`, `id_envio`, `offset_norte_m`, etc.).
- ✅ `crypto.randomUUID()` se invoca implícitamente al crear (verificar que `id_trayectoria` es string válido).

### 2.2. CalcularTrayectoria.usecase.test.ts

**Mocks a preparar:**
- `ForGettingWeather.obtenerPorCoordenadas(lat, lon)` → `Promise<CondicionesClimaticas>`
- `ForCalculatingTrajectory.calcular(input)` → `Promise<ResultadoTrayectoria>`

**Escenarios:**
- ✅ Orquesta correctamente: weather → calculator → entidad.
- ✅ Invierte `coordinates: [lon, lat]` de `destino` al llamar al weather.
- ✅ Usa `crypto.randomUUID()` para el `id_trayectoria` generado.
- ✅ Propaga `id_envio`, `peso_total_kg`, `altitud_liberacion_m` desde el input hasta la entidad resultante.
- ✅ En caso de error del weatherService, la promesa rechaza con el error original.
- ✅ En caso de error del trajectoryCalculator, la promesa rechaza con el error original.

### 2.3. TrajectoryCalculatorAdapter.test.ts

**Instancia real, sin mocks** (tests de lógica de cálculo).

- ✅ `tiempoCaida` para 1000 m ≈ 14.28 s (validar con `Math.sqrt(2 * 1000 / 9.81)`).
- ✅ Offset norte y este se calculan según velocidad y dirección del viento.
- ✅ `condiciones_seguras = true` cuando `velocidad_viento_ms < 15`.
- ✅ `condiciones_seguras = false` cuando `velocidad_viento_ms >= 15`.
- ✅ `punto_lanzamiento` se proyecta desde el destino sumando el offset (verificar coordenadas resultantes).
- ✅ `timestamp_estimado` es `Date.now() + tiempoCaida * 1000`.
- 🧪 Testear en ecuador vs latitudes altas para validar corrección por `cos(latRad)`.

### 2.4. OpenMeteoWeatherAdapter.test.ts

**Mock de `fetch`** con `vi.fn()`.

- ✅ `construirUrl(lat, lon)` genera exactamente la URL esperada con los query params (`latitude`, `longitude`, `current`, `wind_speed_unit`).
- ✅ `mapearAModelo` traduce correctamente la respuesta JSON a `CondicionesClimaticas`.
- ✅ Lanza error con mensaje claro cuando `response.ok` es `false`.
- ✅ Maneja respuestas 200 con datos completos devolviendo todas las propiedades (`velocidad_viento_ms`, `direccion_viento_grados`, etc.).

---

## 3. Tests de Integración (Opcional pero Recomendado)

**Ubicación:** `launcher_app/tests/integration/trayectoria/`

### 3.1. CalcularTrayectoria.integration.test.ts
- Inyecta adaptadores reales (no mocks).
- Mock externo: interceptar `fetch` a `api.open-meteo.com` con `msw` o `vi.stubGlobal('fetch', ...)`.
- Verificar que `calcularTrayectoriaUseCase.ejecutar(...)` devuelve una `Trayectoria` válida con todas las propiedades.

> **Nota:** Evitar llamadas reales a Open-Meteo en CI. Usar `msw` o un stub de `globalThis.fetch`.

---

## 4. Validación Final

| Paso | Comando | Criterio de éxito |
|------|---------|-------------------|
| Typecheck | `npx tsc --noEmit` | 0 errores |
| Lint | `npm run lint` | 0 errores/0 warnings |
| Tests unitarios | `npm run test -- trayectoria` | Todos los tests del dominio pasan |
| Tests integración (si aplica) | `npm run test -- integration/trayectoria` | Todos pasan |

---

## 5. Resumen de Tareas

| # | Tarea | Archivo(s) |
|---|-------|------------|
| 1 | Agregar imports en container.ts | `src/container.ts` |
| 2 | Instanciar y exportar adaptadores y use-case | `src/container.ts` |
| 3 | Crear `Trayectoria.entity.test.ts` | `tests/unit-test/trayectoria/Trayectoria.entity.test.ts` |
| 4 | Crear `CalcularTrayectoria.usecase.test.ts` | `tests/unit-test/trayectoria/CalcularTrayectoria.usecase.test.ts` |
| 5 | Crear `TrajectoryCalculatorAdapter.test.ts` | `tests/unit-test/trayectoria/TrajectoryCalculatorAdapter.test.ts` |
| 6 | Crear `OpenMeteoWeatherAdapter.test.ts` | `tests/unit-test/trayectoria/OpenMeteoWeatherAdapter.test.ts` |
| 7 | (Opc.) Crear test de integración | `tests/integration/trayectoria/...` |
| 8 | Ejecutar validaciones finales | Terminal |

---

## Notas de Arquitectura

- **No se tocan rutas API ni Server Actions.** El módulo se inyecta solo para uso interno (por ejemplo, para que `RegistrarLanzadaUseCase` pueda calcular trayectoria antes de lanzar).
- **No hay entidad de persistencia** para `Trayectoria`; la clase `Trayectoria` es una entidad transitiva de dominio. Si en el futuro se decide persistir, se agregará un port `ForPersistingTrayectoria` sin modificar el core.
- **Dependencias externas:** `OpenMeteoWeatherAdapter` realiza `fetch` a internet. En `container.ts` se planifica como singleton; si se requiere paralelismo con instancias separadas, se cambiará a factory.
