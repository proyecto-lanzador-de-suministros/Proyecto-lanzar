# BullMQ y Redis — Decisión y justificación

## Estado actual (v0.1)

Las notificaciones se entregan por dos canales:

1. **Registro en base de datos** (siempre): `prisma.notificacion.create()` — sincrónico, <5ms.
2. **Correo electrónico** (best-effort): `nodemailer` vía SMTP — fire-and-forget, no bloquea el response.

No hay cola de mensajería. El email se envía directamente desde el adaptador `NotificationServiceAdapter` sin intermediarios. Si el envío falla, se loguea el error pero no se reintenta.

## ¿Por qué no BullMQ + Redis?

La versión actual del proyecto decidió **no incluir BullMQ** por las siguientes razones:

### 1. Costo de infraestructura

| Recurso | Precio estimado/mes |
|---|---|
| Redis (Railway) | $5 |
| Worker (Railway) | ~$0.29 (con sleep) |

Si bien los costos no son altos, para un proyecto universitario sin financiamiento se priorizó un deploy **sin dependencias pagas**.

### 2. Redis obligatorio vs. opcional

Antes de esta decisión, Redis era opcional (solo para caché de clima, degradaba gracefulmente). BullMQ habría hecho Redis **obligatorio**, aumentando la fricción para nuevos desarrolladores y para el CI/testing.

### 3. Volumen actual de notificaciones

El sistema procesa decenas de notificaciones, no miles. Una cola persistente con reintentos automáticos es innecesaria para el caudal actual. El registro en DB ya garantiza que la notificación no se pierde.

### 4. Complejidad operativa

BullMQ requiere un worker separado corriendo 24/7, monitoreo de colas, y gestión de reintentos. Esto agrega un punto de fallo y complejidad que no se justifica para las funcionalidades actuales.

## ¿Qué se simula y cómo?

BullMQ ofrece tres capacidades principales. Acá se detalla cómo se maneja cada una sin la biblioteca:

| Capacidad de BullMQ | Implementación actual |
|---|---|
| **Cola persistente** | No se persiste la cola. El email se intenta una vez y se descarta si falla. La notificación ya quedó registrada en DB. |
| **Reintentos automáticos** | No hay reintentos. Se loguea el error. Un proceso manual o futuro batch job podría re-enviar emails fallidos consultando `Notificacion` donde `canal_envio IS NULL`. |
| **Worker dedicado** | No hay worker. El email se envía en el mismo proceso del request, pero sin `await` (fire-and-forget), por lo que no bloquea al usuario. |

## ¿Cuándo tendría sentido agregar BullMQ?

1. **Múltiples canales de notificación**: si además de email se agregan push notifications, SMS o WhatsApp, una cola centralizada evita duplicar lógica de reintentos.
2. **Alto volumen**: si el sistema llega a cientos de notificaciones por minuto, tener un worker dedicado evita que el envío de emails compita con el request loop de Next.js.
3. **Reintentos obligatorios**: si el negocio exige que ningún email se pierda (ej.: notificaciones de aprobación de cuenta), BullMQ con backoff exponencial es más confiable que un `try/catch` simple.
4. **Tareas programadas**: limpieza de datos, generación de reportes, recordatorios diarios — BullMQ Job Schedulers o `node-cron` serían necesarios.

## Stack actual de notificaciones

```
src/infrastructure/notifications/emailSender.ts  ← Nodemailer (SMTP)
src/modules/notificaciones/infrastructure/adapters/NotificationServiceAdapter.ts
src/modules/notificaciones/domain/ports/forNotifying.port.ts
src/modules/notificaciones/domain/ports/forNotifyingCuenta.port.ts
```

Para migrar a BullMQ en el futuro, solo habría que modificar `NotificationServiceAdapter` para que, en vez de llamar a `sendEmail()` directo, encola un job. El resto del sistema (puertos, casos de uso, container) no cambiaría.
