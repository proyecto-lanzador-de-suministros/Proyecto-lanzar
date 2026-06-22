# Plan: Agregar validación de solicitud existente en ProgramarEnvioUseCase

## 1. `src/modules/errors/domain/factories.ts`

Agregar al final, antes del `};`:

```typescript
  envioDuplicado: (id_solicitud: string) =>
    new DomainError(
      "ENVIO_DUPLICADO",
      `Ya existe un envío programado para la solicitud ${id_solicitud}.`,
      { id_solicitud },
    ),

  solicitudNoProgramable: (estadoActual: string) =>
    new DomainError(
      "SOLICITUD_NO_PROGRAMABLE",
      `No se puede programar un envío para una solicitud en estado "${estadoActual}". La solicitud debe estar en estado "Lista".`,
      { estadoActual },
    ),

  baseNoCoincide: (id_base_input: string, id_base_solicitud: string | undefined) =>
    new DomainError(
      "BASE_NO_COINCIDE",
      `La base ${id_base_input} no coincide con la base asignada a la solicitud (${id_base_solicitud ?? "sin base"}).`,
      { id_base_input, id_base_solicitud },
    ),
```

---

## 2. `src/modules/envios/domain/ports/forManagingEnvios.port.ts`

Agregar método a la interface `ForManagingEnvios`:

```typescript
  buscarPorIdSolicitud(id_solicitud: string): Promise<Envio | null>;
```

---

## 3. `src/modules/envios/infrastructure/adapters/PrismaEnvioRepository.ts`

Implementar el método `buscarPorIdSolicitud`. Agregar después de `buscarPorId`:

```typescript
  async buscarPorIdSolicitud(id_solicitud: string): Promise<Envio | null> {
    const row = await prisma.envio.findFirst({ where: { id_solicitud } });
    if (!row) return null;
    return {
      id_envio: row.id_envio,
      id_solicitud: row.id_solicitud,
      id_base: row.id_base,
      fecha_hora_programada: row.fecha_hora,
      estado_envio: row.estado_envio,
    };
  }
```

---

## 4. `src/modules/envios/domain/use-cases/ProgramarEnvio.usecase.ts`

Reemplazar contenido completo con:

```typescript
import { ForManagingEnvios, Envio } from "../ports/forManagingEnvios.port";
import { ForManagingSolicitudes } from "@/src/modules/solicitudes/domain/ports/forManagingSolicitudes.port";
import { Errores } from "@/src/modules/errors/domain/factories";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export interface ProgramarEnvioInput {
  id_solicitud: string;
  id_base: string;
}

export class ProgramarEnvioUseCase {
  constructor(
    private readonly envioRepository: ForManagingEnvios,
    private readonly solicitudRepository: ForManagingSolicitudes,
  ) {}

  async ejecutar(input: ProgramarEnvioInput): Promise<Envio> {
    // 1. Validar que la solicitud existe
    const solicitud = await this.solicitudRepository.buscarPorId(input.id_solicitud);
    if (!solicitud) {
      throw Errores.solicitudNoEncontrada(input.id_solicitud);
    }

    // 2. Validar que la solicitud está en estado Lista
    if (solicitud.estado !== EstadoSolicitud.Lista) {
      throw Errores.solicitudNoProgramable(solicitud.estado);
    }

    // 3. Validar que el id_base del input coincide con el de la solicitud
    if (input.id_base !== solicitud.id_base) {
      throw Errores.baseNoCoincide(input.id_base, solicitud.id_base);
    }

    // 4. Validar que no exista ya un envío para esta solicitud
    const envioExistente = await this.envioRepository.buscarPorIdSolicitud(input.id_solicitud);
    if (envioExistente) {
      throw Errores.envioDuplicado(input.id_solicitud);
    }

    // 5. Crear el envío
    return this.envioRepository.crear({
      id_solicitud: input.id_solicitud,
      id_base: input.id_base,
      fecha_hora_programada: new Date(),
      estado_envio: "programado",
    });
  }
}
```

---

## 5. `src/container.ts`

Cambiar línea 255:

```typescript
export const programarEnvioUseCase = new ProgramarEnvioUseCase(envioRepository, solicitudRepository);
```

---

## 6. Verificación

```bash
cd launcher_app
npx tsc --noEmit
```
