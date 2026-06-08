# Estructura del proyecto

Este proyecto sigue una arquitectura de **Monolito Modular con organización interna Hexagonal** (Ports & Adapters).

## Qué significa cada carpeta

### `src/modules/<modulo>/domain/`
El corazón de cada módulo. No depende de ninguna librería externa.
- `entities/` — Clases con reglas de negocio puras (ej. transiciones de estado de una Solicitud)
- `ports/` — Interfaces que definen cómo el dominio habla con el mundo exterior
- `use-cases/` — Orquestación de la lógica de aplicación (ej. CrearSolicitud coordina stock, trayectoria y notificaciones)

### `src/modules/<modulo>/infrastructure/adapters/`
Implementaciones concretas de los puertos. Aquí vive Prisma, SDKs externos, etc.
El dominio nunca importa desde esta carpeta — es siempre al revés.

### `src/infrastructure/`
Adaptadores de servicios externos compartidos entre módulos.
- `db/` — Cliente Prisma
- `weather/` — API de clima
- `maps/` — Servicio de mapas
- `notifications/` — Email / push
- `trajectory/` — Calculador físico de trayectoria

### `src/app/api/`
Route handlers de Next.js. Son los **driver adapters**: reciben peticiones HTTP y las delegan al caso de uso correspondiente. No contienen lógica de negocio.

### `src/actions/`
Server actions de Next.js. Driver adapters alternativos para operaciones disparadas desde componentes del cliente.

### `src/container.ts`
Único archivo que conoce tanto el dominio como la infraestructura concreta.
Instancia los adaptadores y los inyecta en los casos de uso.
Si necesitás cambiar un proveedor (ej. reemplazar la API de clima), este es el único lugar que cambia junto al nuevo adaptador.
