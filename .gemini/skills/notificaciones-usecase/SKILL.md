---
name: notificaciones-usecase
description: >
  Diseñar e implementar notificaciones en el sistema — incluyendo definir el puerto
  ForNotifying, crear o extender casos de uso que disparan notificaciones, y razonar
  sobre qué eventos deben notificarse y a quién. Usá este skill siempre que se mencione
  notificar, avisar, alertar a un usuario, o cuando un caso de uso deba disparar una
  notificación como efecto secundario. También aplica si se pregunta cómo modelar el
  módulo de notificaciones, qué puerto usar, o cómo conectar notificaciones a otros módulos.
---

# Skill: Notificaciones

## Decisión arquitectónica clave (ADR-001)

El ADR-001 establece explícitamente:

> `NotificationAdapter` implementa el puerto `forNotifying` —
> **el mecanismo de entrega (email, push, cola) es transparente al dominio**

Esto significa:
- El dominio **no sabe ni le importa** si la notificación llega por email, push, WhatsApp o SMS.
- El canal se decide en el adaptador (infraestructura), no en el caso de uso.
- El dominio solo declara *qué pasó* y *a quién avisar*.
- Las notificaciones son **fire-and-forget**: no se persisten, no se reintentan.

---

## Puerto: `ForNotifying`

Este es el único contrato que el dominio conoce:

```ts
// domain/ports/forNotifying.port.ts

export type TipoNotificacion =
  | "SOLICITUD_CREADA"
  | "SOLICITUD_CANCELADA"
  | "SOLICITUD_ANULADA"
  | "REMITENTE_ASIGNADO"
  | "SOLICITUD_EN_CAMINO"
  | "SOLICITUD_LANZADA"
  | "SOLICITUD_RECIBIDA";

export type NotificacionPayload = {
  destinatario: string;          // id del usuario a notificar
  tipo: TipoNotificacion;
  payload?: Record<string, unknown>; // datos extra opcionales (id_solicitud, etc.)
};

export interface ForNotifying {
  enviar(notificacion: NotificacionPayload): Promise<void>;
}
```

**Reglas del puerto:**
- `enviar` es siempre `async` pero el caso de uso puede llamarla con `await` o sin él
  (fire-and-forget: no bloquear si no es crítico).
- El adaptador decide el canal; el dominio solo llama a `enviar`.
- Si el adaptador falla, no debe romper el flujo principal del caso de uso
  (ver sección "Manejo de errores" más abajo).
- Para agregar un nuevo tipo de evento, extender el union type `TipoNotificacion`.

---

## Cuándo notificar — mapa de eventos

| Evento de dominio | Use case que lo dispara | Quién recibe la notificación |
|---|---|---|
| Solicitud creada | `CrearSolicitud` | Admin / base asignada |
| Remitente asignado | `AsignarRemitente` | Remitente asignado |
| Solicitud cancelada | `CancelarSolicitud` | Solicitante (si cancela admin) |
| Solicitud anulada | `AnularSolicitud` | Solicitante |
| Solicitud en camino | `RegistrarEnCamino` | Solicitante |
| Solicitud lanzada | `RegistrarLanzada` | Solicitante |
| Solicitud recibida | `ConfirmarRecibida` | Admin / remitente |

Para ver cómo se integra en un use case complejo, leer `references/ejemplos.md`.

---

## Cómo agregar notificaciones a un use case existente

### Paso 1 — Agregar el puerto al constructor

```ts
export class MiUseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    private notifier: ForNotifying,   // ← agregar
  ) {}
}
```

### Paso 2 — Llamar `enviar` como último paso

Las notificaciones van **siempre al final**, después de persistir. Nunca antes.

```ts
async ejecutar(input: MiInput): Promise<Solicitud> {
  // 1. lógica de negocio...
  // 2. persistir
  await this.repo.actualizarEstado(...);
  // 3. notificar — último paso, fire-and-forget
  await this.notifier.enviar({
    destinatario: solicitud.id_usuario,
    tipo: "SOLICITUD_CANCELADA",
    payload: { id_solicitud: solicitud.id_solicitud },
  });
  return solicitud;
}
```

### Paso 3 — Manejo de errores (patrón recomendado)

Como es fire-and-forget, los errores del notifier **no deben interrumpir** el flujo:

```ts
// Opción A: ignorar silenciosamente el error del notifier
try {
  await this.notifier.enviar({ ... });
} catch {
  // la solicitud ya fue persistida; la notificación es best-effort
}

// Opción B: fire-and-forget real (no esperar)
this.notifier.enviar({ ... }).catch(() => {});
```

Usar **Opción A** si se quiere loguear el fallo en el futuro.
Usar **Opción B** si la notificación no debe agregar latencia al response.

---

## Checklist antes de entregar

- [ ] ¿El puerto `ForNotifying` está en `domain/ports/`?
- [ ] ¿El use case recibe `ForNotifying` como parámetro del constructor (no lo instancia)?
- [ ] ¿La llamada a `enviar` es el **último paso** del método `ejecutar`?
- [ ] ¿Los errores del notifier no rompen el flujo principal?
- [ ] ¿El tipo de notificación está en el union type `TipoNotificacion`?
- [ ] ¿El adaptador concreto vive en `infrastructure/`, no en `domain/`?

---

## Referencias

- `references/ejemplos.md` — Use cases completos que integran notificaciones
- `references/adaptador.md` — Cómo implementar el adaptador en infraestructura
