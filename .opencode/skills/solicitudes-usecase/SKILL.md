---
name: solicitudes-usecase
description: >
  Crear nuevos casos de uso para el módulo `solicitudes/` del proyecto de arquitectura
  y diseño. Usá este skill siempre que se pida agregar, implementar o completar un
  caso de uso (use case) del dominio de solicitudes, incluso si el pedido está en lenguaje
  informal ("hacé el CU de...", "implementá que el admin pueda...", "completá el TODO de...").
  También aplica cuando se pide revisar, refactorizar o extender un use case existente.
---

# Skill: Casos de uso — módulo `solicitudes/`

## Contexto del proyecto

El módulo vive en `domain/use-cases/` y sigue **Arquitectura Hexagonal**:
las clases de uso no conocen infraestructura; solo hablan con puertos (interfaces).

---

## Patrón obligatorio

Todos los use cases siguen **exactamente** esta estructura:

```ts
export class <Nombre>UseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    // otros puertos si aplica (stock, usuarios, notificaciones, historial)
  ) {}

  async ejecutar(input: <Nombre>Input): Promise<<Nombre>Output> {
    // orquestación aquí
  }
}
```

**Reglas que nunca se rompen:**
1. **Sin herencia** — cada clase es independiente.
2. **Constructor recibe puertos** (interfaces), nunca implementaciones concretas.
3. **Un único método público**: `ejecutar(input)`.
4. **La entidad valida** — las reglas de negocio y transiciones de estado viven en `Solicitud`, no en el use case.
5. **Tipos explícitos** — definir `Input` y `Output` como `type` o `interface` en el mismo archivo o en `types/`.

---

## Puerto principal

Leé `references/port.md` para ver la firma completa de `ForManagingSolicitudes`
y saber qué métodos tenés disponibles antes de escribir código.

---

## Niveles de complejidad

Antes de escribir, clasificá el caso de uso:

| Nivel | Dependencias | Pasos típicos | Cuándo usarlo |
|---|---|---|---|
| **Simple** | Solo `repo` | 1–2 (listar, cambiar estado) | Operaciones CRUD directas |
| **Intermedio** | `repo` + 1 más | 2–4 (crear entidad, validar, guardar) | Lógica de negocio moderada |
| **Complejo** | `repo` + 2 o más | 4–6+ (permisos, validar estado, efectos secundarios) | Cruza módulos, libera recursos, notifica |

Ver `references/ejemplos.md` para un ejemplo concreto de cada nivel.

---

## Proceso para crear un nuevo use case

### 1. Entender el requerimiento
- ¿Qué actor lo ejecuta? (solicitante, admin, sistema)
- ¿Qué precondiciones deben cumplirse?
- ¿Qué efectos tiene? (cambia estado, libera stock, notifica, registra historial)
- ¿Qué errores pueden ocurrir?

### 2. Determinar dependencias
- ¿Solo necesita el repo de solicitudes? → simple
- ¿Necesita verificar usuarios, liberar stock, notificar, o guardar historial? → agregar esos puertos

Puertos disponibles en el proyecto:
- `ForManagingSolicitudes` — repo principal
- `ForManagingStock` — liberar/reservar stock por base
- `ForManagingUsuarios` — verificar existencia/rol de un usuario
- `ForSendingNotifications` — enviar notificaciones
- `ForManagingHistorial` — registrar eventos de auditoría

### 3. Definir tipos Input/Output
```ts
type EjemploInput = {
  id_solicitud: string;
  id_usuario: string;
  rol: "solicitante" | "admin";
  // ...
};

type EjemploOutput = Solicitud; // o void, o un DTO
```

### 4. Implementar en orden
1. Buscar la solicitud (si aplica) y lanzar error si no existe
2. Verificar permisos por rol
3. Llamar al método de la entidad que valida la transición de estado
4. Ejecutar efectos secundarios (stock, notificaciones, historial)
5. Persistir con `repo.actualizarEstado(...)` o `repo.guardar(...)`
6. Retornar el resultado

### 5. Checklist antes de entregar

- [ ] ¿La clase tiene exactamente un método `ejecutar`?
- [ ] ¿Todos los parámetros del constructor son interfaces/puertos?
- [ ] ¿Las validaciones de estado están en la entidad, no en el use case?
- [ ] ¿Hay manejo de error si `buscarPorId` retorna `null`?
- [ ] ¿El archivo se llama `<Nombre>.usecase.ts`?
- [ ] ¿Los tipos Input/Output están definidos explícitamente?

---

## Estados y transiciones válidas

La entidad `Solicitud` maneja las transiciones. Los estados posibles son:

```
Creada → Asignada → EnPreparacion → Lista → EnCamino → Lanzada → Recibida
                                                              ↘ Cancelada (desde Creada o Asignada)
                                                              ↘ Anulada   (desde cualquier estado activo, solo admin)
```

Si un use case necesita cambiar de estado, **siempre** llamar al método correspondiente
en la entidad (ej: `solicitud.cancelar(motivo)`) y no manipular el estado directamente.

---

## Referencias

- `references/port.md` — Firma completa del puerto `ForManagingSolicitudes`
- `references/ejemplos.md` — Tres ejemplos completos: simple, intermedio, complejo
