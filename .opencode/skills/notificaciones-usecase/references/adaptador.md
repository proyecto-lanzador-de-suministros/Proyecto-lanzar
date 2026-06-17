# Adaptador de notificaciones (infraestructura)

El adaptador vive en `infrastructure/` y es el único lugar del proyecto
donde se decide el canal real de entrega. El dominio no lo conoce.

---

## Estructura sugerida

```
infrastructure/
  notifications/
    NotificationAdapter.ts     ← implementación concreta
    email/
      EmailSender.ts           ← lógica específica del canal
    push/
      PushSender.ts
```

---

## Ejemplo de adaptador mínimo (consola / desarrollo)

Útil para desarrollo y testing sin configurar un proveedor real:

```ts
// infrastructure/notifications/NotificationAdapter.ts
import { ForNotifying, NotificacionPayload } from "../../domain/ports/forNotifying.port";

export class ConsoleNotificationAdapter implements ForNotifying {
  async enviar(notificacion: NotificacionPayload): Promise<void> {
    console.log(`[NOTIFICACION] → ${notificacion.tipo} para ${notificacion.destinatario}`, notificacion.payload);
  }
}
```

---

## Ejemplo de adaptador real (email con Resend/Nodemailer)

```ts
// infrastructure/notifications/NotificationAdapter.ts
import { ForNotifying, NotificacionPayload } from "../../domain/ports/forNotifying.port";
import { Resend } from "resend"; // o cualquier cliente de email

export class EmailNotificationAdapter implements ForNotifying {
  private client: Resend;

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY);
  }

  async enviar(notificacion: NotificacionPayload): Promise<void> {
    const template = this.resolverTemplate(notificacion);
    await this.client.emails.send({
      from: "sistema@tudominio.com",
      to: template.destinatarioEmail,
      subject: template.asunto,
      html: template.cuerpo,
    });
  }

  private resolverTemplate(notificacion: NotificacionPayload) {
    // Mapear tipo → contenido del email
    const templates: Record<string, { asunto: string; cuerpo: string; destinatarioEmail: string }> = {
      SOLICITUD_ANULADA: {
        destinatarioEmail: `${notificacion.destinatario}@example.com`, // resolver desde DB si aplica
        asunto: "Tu solicitud fue anulada",
        cuerpo: `<p>La solicitud fue anulada. Motivo: ${notificacion.payload?.motivo}</p>`,
      },
      REMITENTE_ASIGNADO: {
        destinatarioEmail: `${notificacion.destinatario}@example.com`,
        asunto: "Tenés una solicitud asignada",
        cuerpo: `<p>Se te asignó la solicitud ${notificacion.payload?.id_solicitud}.</p>`,
      },
      // ... resto de tipos
    };
    return templates[notificacion.tipo];
  }
}
```

---

## Cómo inyectar el adaptador

En la composición del módulo (ej: `app.ts` o el contenedor de DI):

```ts
// Desarrollo
const notifier = new ConsoleNotificationAdapter();

// Producción
const notifier = new EmailNotificationAdapter();

// Inyectar en los use cases que lo necesiten
const anularSolicitud = new AnularSolicitudUseCase(solicitudRepo, notifier);
const asignarRemitente = new AsignarRemitenteUseCase(solicitudRepo, usuariosRepo, notifier, historialRepo);
```

---

## Para agregar un canal nuevo (push, WhatsApp, etc.)

1. Crear un nuevo adaptador que implemente `ForNotifying`
2. O extender el adaptador existente para enviar por múltiples canales:

```ts
export class MultiChannelNotificationAdapter implements ForNotifying {
  constructor(
    private email: EmailSender,
    private push: PushSender,
  ) {}

  async enviar(notificacion: NotificacionPayload): Promise<void> {
    // El dominio sigue llamando a un solo `enviar`
    // acá se decide la lógica de canales
    await Promise.allSettled([
      this.email.send(notificacion),
      this.push.send(notificacion),
    ]);
  }
}
```

El dominio **nunca cambia** cuando se agrega un canal. Solo cambia el adaptador.
