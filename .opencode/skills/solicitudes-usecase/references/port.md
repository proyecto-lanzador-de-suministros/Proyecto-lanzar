# Puerto: `ForManagingSolicitudes`

**Ubicación:** `domain/ports/forManagingSolicitudes.port.ts`

```ts
import { Solicitud } from "../entities/Solicitud";
import { EstadoSolicitud } from "../entities/Solicitud";

export interface ForManagingSolicitudes {
  guardar(solicitud: Solicitud): Promise<void>;
  buscarPorId(id: string): Promise<Solicitud | null>;
  listarPorSolicitante(userId: string): Promise<Solicitud[]>;
  listarTodas(estadoFiltro?: string): Promise<Solicitud[]>;
  listarPorBase(id_base: string): Promise<Solicitud[]>;
  listarPendientes(id_base: string): Promise<Solicitud[]>;
  actualizarEstado(
    id: string,
    nuevoEstado: EstadoSolicitud,
    extras?: {
      motivoCancelacion?: string;
      motivoAnulacion?: string;
      id_base?: string;
      fecha_entrega?: Date;
    }
  ): Promise<void>;
}
```

## Cuándo usar cada método

| Método | Usar cuando… |
|---|---|
| `guardar` | Se crea una solicitud nueva por primera vez |
| `buscarPorId` | Se necesita la entidad completa para validar o modificar |
| `listarPorSolicitante` | Un usuario consulta sus propias solicitudes |
| `listarTodas` | Admin consulta todas, con filtro de estado opcional |
| `listarPorBase` | Se listan solicitudes asignadas a una base logística |
| `listarPendientes` | Se buscan solicitudes en estado `Creada` sin base asignada |
| `actualizarEstado` | Cualquier transición de estado después de validar en la entidad |

## Notas

- `buscarPorId` retorna `null` si no existe — **siempre** verificar antes de operar.
- `actualizarEstado` acepta `extras` opcionales; pasarlos cuando el estado lo requiera
  (ej: `motivoCancelacion` al cancelar, `id_base` al asignar).
- Nunca llamar `actualizarEstado` sin haber invocado primero el método de la entidad
  que valida la transición.
