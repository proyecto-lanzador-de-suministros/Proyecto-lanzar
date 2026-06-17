# Ejemplos: use cases con notificaciones

## Caso simple — notificación directa al solicitante

`AnularSolicitud.usecase.ts` — el admin anula y el solicitante recibe aviso.

```ts
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForNotifying } from "../../notificaciones/ports/forNotifying.port";
import { Solicitud } from "../entities/Solicitud";

type AnularSolicitudInput = {
  id_solicitud: string;
  id_admin: string;
  motivo: string;
};

export class AnularSolicitudUseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    private notifier: ForNotifying,
  ) {}

  async ejecutar(input: AnularSolicitudInput): Promise<Solicitud> {
    // 1. Buscar
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);
    if (!solicitud) throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);

    // 2. La entidad valida que se puede anular desde el estado actual
    solicitud.anular(input.motivo);

    // 3. Persistir
    await this.repo.actualizarEstado(
      solicitud.id_solicitud,
      solicitud.estado,
      { motivoAnulacion: input.motivo },
    );

    // 4. Notificar al solicitante — fire-and-forget, no rompe el flujo si falla
    try {
      await this.notifier.enviar({
        destinatario: solicitud.id_usuario,
        tipo: "SOLICITUD_ANULADA",
        payload: {
          id_solicitud: solicitud.id_solicitud,
          motivo: input.motivo,
        },
      });
    } catch {
      // la solicitud ya fue anulada; la notificación es best-effort
    }

    return solicitud;
  }
}
```

---

## Caso con múltiples destinatarios — `RegistrarLanzada.usecase.ts`

Cuando la solicitud se lanza, se notifica al solicitante Y se podría notificar
a otro actor (ej: base). Se llaman dos `enviar` independientes.

```ts
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForNotifying } from "../../notificaciones/ports/forNotifying.port";
import { Solicitud } from "../entities/Solicitud";

type RegistrarLanzadaInput = {
  id_solicitud: string;
  id_remitente: string;
};

export class RegistrarLanzadaUseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    private notifier: ForNotifying,
  ) {}

  async ejecutar(input: RegistrarLanzadaInput): Promise<Solicitud> {
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);
    if (!solicitud) throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);

    // Validar que quien ejecuta es el remitente asignado
    if (solicitud.id_remitente !== input.id_remitente) {
      throw new Error("Solo el remitente asignado puede registrar el lanzamiento.");
    }

    // La entidad valida la transición EnCamino → Lanzada
    solicitud.registrarLanzada();

    await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado);

    // Notificar a múltiples destinatarios de forma independiente
    await Promise.allSettled([
      this.notifier.enviar({
        destinatario: solicitud.id_usuario,
        tipo: "SOLICITUD_LANZADA",
        payload: { id_solicitud: solicitud.id_solicitud },
      }),
      // Si hubiera más destinatarios, irían acá como entradas adicionales del array
    ]);

    return solicitud;
  }
}
```

> **Nota sobre `Promise.allSettled`:** a diferencia de `Promise.all`, no falla si
> una notificación individual lanza error. Es el patrón correcto para fire-and-forget
> con múltiples destinatarios.

---

## Caso complejo — `AsignarRemitente.usecase.ts`

Notifica al remitente recién asignado. Ya documentado en `solicitudes-usecase/references/ejemplos.md`.
Repetir el patrón: notificación como último paso, dentro de try/catch o con `allSettled`.
