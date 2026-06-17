# Ejemplos de casos de uso

## Simple — `CambiarEstadoSolicitud.usecase.ts`

Una dependencia, un paso, sin lógica de negocio extra.

```ts
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { EstadoSolicitud } from "../entities/Solicitud";

type CambiarEstadoInput = {
  id_solicitud: string;
  nuevoEstado: EstadoSolicitud;
};

export class CambiarEstadoSolicitudUseCase {
  constructor(private repository: ForManagingSolicitudes) {}

  async ejecutar(input: CambiarEstadoInput): Promise<void> {
    await this.repository.actualizarEstado(input.id_solicitud, input.nuevoEstado);
  }
}
```

---

## Intermedio — `CrearSolicitud.usecase.ts`

Dos dependencias, tres pasos: crear entidad, persistir, delegar a otro use case.

```ts
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { Solicitud } from "../entities/Solicitud";
import { ControlarSolicitudUseCase } from "./ControlarSolicitud.usecase";

type CrearSolicitudInput = {
  id_usuario: string;
  productos: { id_producto: string; cantidad: number }[];
  // ... otros campos de la solicitud
};

type CrearSolicitudOutput = {
  solicitud: Solicitud;
  stockDisponible: boolean;
};

export class CrearSolicitudUseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    private controlarSolicitud: ControlarSolicitudUseCase,
  ) {}

  async ejecutar(input: CrearSolicitudInput): Promise<CrearSolicitudOutput> {
    const solicitud = Solicitud.crear({
      ...input,
      id_solicitud: crypto.randomUUID(),
    });
    await this.repo.guardar(solicitud);
    return this.controlarSolicitud.ejecutar(solicitud);
  }
}
```

---

## Complejo — `CancelarSolicitud.usecase.ts`

Dos dependencias, cinco pasos: buscar, permisos, validar estado en entidad,
liberar stock, persistir.

```ts
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingStock } from "../../stock/ports/forManagingStock.port";
import { Solicitud } from "../entities/Solicitud";

type CancelarSolicitudInput = {
  id_solicitud: string;
  id_usuario: string;
  rol: "solicitante" | "admin";
  motivo: string;
};

export class CancelarSolicitudUseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    private stock: ForManagingStock,
  ) {}

  async ejecutar(input: CancelarSolicitudInput): Promise<Solicitud> {
    // 1. Buscar — lanzar si no existe
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);
    if (!solicitud) {
      throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);
    }

    // 2. Verificar permisos por rol
    if (input.rol === "solicitante" && solicitud.id_usuario !== input.id_usuario) {
      throw new Error("No tenés permiso para cancelar esta solicitud.");
    }

    // 3. La entidad valida que el estado permita cancelación (Creada | Asignada)
    solicitud.cancelar(input.motivo);

    // 4. Efecto secundario: liberar stock si tenía base asignada
    if (solicitud.id_base) {
      await this.stock.liberarReserva({
        id_base: solicitud.id_base,
        productos: solicitud.productos,
      });
    }

    // 5. Persistir el nuevo estado con el motivo
    await this.repo.actualizarEstado(
      solicitud.id_solicitud,
      solicitud.estado,
      { motivoCancelacion: input.motivo },
    );

    return solicitud;
  }
}
```

---

## Complejo con más dependencias — `AsignarRemitente.usecase.ts`

Cuatro dependencias: repo + usuarios + notificaciones + historial.

```ts
import { ForManagingSolicitudes } from "../ports/forManagingSolicitudes.port";
import { ForManagingUsuarios } from "../../usuarios/ports/forManagingUsuarios.port";
import { ForSendingNotifications } from "../../notificaciones/ports/forSendingNotifications.port";
import { ForManagingHistorial } from "../../historial/ports/forManagingHistorial.port";
import { Solicitud } from "../entities/Solicitud";

type AsignarRemitenteInput = {
  id_solicitud: string;
  id_remitente: string;
  id_admin: string;
};

export class AsignarRemitenteUseCase {
  constructor(
    private repo: ForManagingSolicitudes,
    private usuarios: ForManagingUsuarios,
    private notifier: ForSendingNotifications,
    private historial: ForManagingHistorial,
  ) {}

  async ejecutar(input: AsignarRemitenteInput): Promise<Solicitud> {
    // 1. Verificar que el remitente existe y tiene el rol correcto
    const remitente = await this.usuarios.buscarPorId(input.id_remitente);
    if (!remitente || remitente.rol !== "remitente") {
      throw new Error("El usuario no existe o no tiene rol de remitente.");
    }

    // 2. Buscar la solicitud
    const solicitud = await this.repo.buscarPorId(input.id_solicitud);
    if (!solicitud) {
      throw new Error(`Solicitud ${input.id_solicitud} no encontrada.`);
    }

    // 3. La entidad asigna y valida la transición de estado
    solicitud.asignarRemitente(input.id_remitente);

    // 4. Persistir
    await this.repo.actualizarEstado(solicitud.id_solicitud, solicitud.estado);

    // 5. Registrar en historial
    await this.historial.registrar({
      entidad: "solicitud",
      id_entidad: solicitud.id_solicitud,
      accion: "REMITENTE_ASIGNADO",
      id_actor: input.id_admin,
    });

    // 6. Notificar al remitente
    await this.notifier.enviar({
      destinatario: input.id_remitente,
      tipo: "SOLICITUD_ASIGNADA",
      payload: { id_solicitud: solicitud.id_solicitud },
    });

    return solicitud;
  }
}
```
