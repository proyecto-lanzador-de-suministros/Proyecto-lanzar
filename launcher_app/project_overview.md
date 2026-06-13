# Project Overview — LauncherApp

> Proyecto universitario de gestión de solicitudes de lanzamiento de paquetes vía aérea.
> **Dominio:** Logística de entregas con drones/aviones. Lenguaje del dominio en **español**.

---

## 1. Árbol de directorios

```
launcher_app/
├── app/                              # Next.js App Router (rutas reales)
│   ├── admin/
│   │   ├── dashboard/page.tsx         # Dashboard de administrador
│   │   ├── layout.tsx                 # Layout con sidebar + UserButton Clerk
│   │   ├── perfil/page.tsx            # Perfil de administrador (UserProfile Clerk)
│   │   └── usuarios/page.tsx          # Gestión de usuarios (esqueleto)
│   ├── api/
│   │   ├── admin/solicitudes/route.ts  # GET listar solicitudes (admin)
│   │   ├── auth/login/route.ts        # GET redirige según rol
│   │   ├── bases/[id]/stock/route.ts  # GET stock de una base (esqueleto)
│   │   ├── solicitudes/
│   │   │   ├── route.ts               # POST crear solicitud
│   │   │   ├── [id]/route.ts          # GET solicitud por ID (esqueleto)
│   │   │   └── [id]/estado/route.ts   # PATCH cambiar estado (esqueleto)
│   ├── components/
│   │   ├── activity/                   # Componentes de actividad (esqueletos)
│   │   │   ├── ActivityStatItem.tsx
│   │   │   └── ActivitySummary.tsx
│   │   ├── help/HelpCard.tsx           # Componente de ayuda (esqueleto)
│   │   ├── layout/
│   │   │   ├── DashboardShell.tsx      # Shell layout reutilizable
│   │   │   ├── Sidebar.tsx            # Barra lateral de navegación
│   │   │   ├── TopBar.tsx             # Barra superior con avatar y notificaciones
│   │   │   └── types.ts               # Tipos para SidebarConfig, TopBarConfig, DashboardShellProps
│   │   ├── map/CoverageMap.tsx         # Mapa de cobertura (esqueleto)
│   │   ├── notifications/
│   │   │   ├── NotificationItem.tsx    # Item de notificación (esqueleto)
│   │   │   └── NotificationsPanel.tsx  # Panel de notificaciones (esqueleto)
│   │   ├── requests/
│   │   │   ├── AssignedRequestsTable.tsx  # Tabla de solicitudes asignadas (mock)
│   │   │   └── RequestRow.tsx             # Fila de solicitud (esqueleto)
│   │   ├── stock/StockCard.tsx         # Tarjeta de stock (esqueleto)
│   │   └── ui/                        # Componentes de UI atómicos
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── DropdownTrigger.tsx
│   │       ├── Logo.tsx
│   │       ├── NavItem.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── Tabs.tsx
│   │       ├── demo/                   # Páginas demo de cada componente UI
│   │       │   ├── avatar-demo/page.tsx
│   │       │   ├── badge-demo/page.tsx
│   │       │   ├── badge-status-demo/page.tsx
│   │       │   ├── button-demo/page.tsx
│   │       │   ├── dropdown-trigger-demo/page.tsx
│   │       │   ├── navitem-demo/page.tsx
│   │       │   ├── progress-bar-demo/page.tsx
│   │       │   └── tabs-demo/page.tsx
│   │       └── tests/                  # Tests unitarios de componentes UI (Vitest)
│   │           ├── Avatar.test.tsx
│   │           ├── Badge.test.tsx
│   │           ├── DropdownTrigger.test.tsx
│   │           ├── NavItem.test.tsx
│   │           ├── ProgressBar.test.tsx
│   │           ├── StatusBadge.test.tsx
│   │           └── Tabs.test.tsx
│   ├── remitente/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Layout con DashboardShell
│   │   │   └── page.tsx               # Dashboard de remitente (esqueleto)
│   │   ├── solicitudes/page.tsx        # Solicitudes asignadas al remitente (esqueleto)
│   │   └── stock/page.tsx             # Gestión de stock del remitente (esqueleto)
│   ├── solicitante/
│   │   ├── dashboard/page.tsx         # Dashboard de solicitante (esqueleto)
│   │   └── solicitudes/
│   │       ├── [id]/page.tsx          # Detalle de solicitud (esqueleto)
│   │       └── nueva/page.tsx         # Formulario crear solicitud (esqueleto)
│   ├── sign-in/[[...sign-in]]/page.tsx  # Página de inicio de sesión (Clerk)
│   ├── sign-up/[[...sign-up]]/page.tsx  # Página de registro (Clerk)
│   ├── status-badge-demo/page.tsx     # Demo legacy de StatusBadge (ruta removida)
│   ├── globals.css                    # Estilos globales Tailwind + variables CSS
│   ├── layout.tsx                     # Layout raíz con ClerkProvider
│   └── page.tsx                       # Página de inicio (redirige a /api/auth/login)
│
├── prisma/
│   └── schema.prisma                  # Schema Prisma (modelo Solicitud)
│
├── src/
│   ├── actions/                       # Server actions (alternativa a API routes)
│   │   ├── solicitudes.actions.ts
│   │   ├── stock.actions.ts
│   │   └── usuarios.actions.ts
│   ├── container.ts                   # Composition root (único punto de wiring)
│   ├── infrastructure/                # Adaptadores de infraestructura global
│   │   ├── db/prisma.client.ts        # Singleton de PrismaClient con Neon adapter
│   │   ├── maps/googleMaps.client.ts  # Cliente Google Maps (esqueleto)
│   │   ├── notifications/notificationClient.ts  # Cliente de notificaciones (esqueleto)
│   │   └── weather/weatherApi.client.ts          # Cliente API clima (esqueleto)
│   ├── modules/                       # Módulos hexagonal (Ports & Adapters)
│   │   ├── auth/                      # Autenticación
│   │   │   ├── domain/
│   │   │   │   ├── ports/forAuthenticating.port.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── IniciarSesion.usecase.ts
│   │   │   │       └── CerrarSesion.usecase.ts
│   │   │   └── infrastructure/adapters/ClerkAuthAdapter.ts
│   │   ├── notificaciones/            # Notificaciones
│   │   │   ├── domain/
│   │   │   │   ├── ports/forNotifying.port.ts
│   │   │   │   └── use-cases/         # 9 casos de uso (uno por estado)
│   │   │   │       ├── NotificarAnulacion.usecase.ts
│   │   │   │       ├── NotificarAsignacion.usecase.ts
│   │   │   │       ├── NotificarEnCamino.usecase.ts
│   │   │   │       ├── NotificarEnPreparacion.usecase.ts
│   │   │   │       ├── NotificarLanzada.usecase.ts
│   │   │   │       ├── NotificarLista.usecase.ts
│   │   │   │       ├── NotificarRecepcion.usecase.ts
│   │   │   │       ├── NotificarRechazo.usecase.ts
│   │   │   │       └── NotificarSolicitudCreada.usecase.ts
│   │   │   └── infrastructure/adapters/NotificationServiceAdapter.ts
│   │   ├── solicitudes/               # Solicitudes de lanzamiento (core del negocio)
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Solicitud.ts   # Entidad principal con estado, prioridad, ubicación
│   │   │   │   │   └── Paquete.ts
│   │   │   │   ├── ports/forManagingSolicitudes.port.ts
│   │   │   │   └── use-cases/         # 12 casos de uso
│   │   │   │       ├── CrearSolicitud.usecase.ts      ✓ implementado
│   │   │   │       ├── ListarSolicitudesAdmin.usecase.ts ✓ implementado
│   │   │   │       ├── AnularSolicitud.usecase.ts
│   │   │   │       ├── CancelarSolicitud.usecase.ts
│   │   │   │       ├── ConfirmarRecibida.usecase.ts
│   │   │   │       ├── ConsultarSolicitudesPendientes.usecase.ts
│   │   │   │       ├── ConsultarSolicitud.usecase.ts
│   │   │   │       ├── ControlarSolicitud.usecase.ts
│   │   │   │       ├── RegistrarEnCamino.usecase.ts
│   │   │   │       ├── RegistrarEnPreparacion.usecase.ts
│   │   │   │       ├── RegistrarLanzada.usecase.ts
│   │   │   │       ├── RegistrarLista.usecase.ts
│   │   │   │       └── tests/CrearSolicitud.test.ts
│   │   │   └── infrastructure/adapters/
│   │   │       ├── PrismaSolicitudRepository.ts       ✓ implementado
│   │   │       └── MockSolicitudesRepository.ts       ✓ implementado
│   │   ├── stock/                      # Gestión de inventario
│   │   │   ├── domain/
│   │   │   │   ├── entities/Stock.ts
│   │   │   │   ├── ports/forManagingStock.port.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── ActualizarStock.usecase.ts
│   │   │   │       └── ConsultarStock.usecase.ts
│   │   │   └── infrastructure/adapters/PrismaStockRepository.ts
│   │   ├── trayectoria/               # Cálculo de trayectoria de lanzamiento
│   │   │   ├── domain/
│   │   │   │   ├── entities/Trayectoria.ts
│   │   │   │   ├── ports/
│   │   │   │   │   ├── forCalculatingTrajectory.port.ts
│   │   │   │   │   └── forGettingWeather.port.ts
│   │   │   │   └── use-cases/CalcularTrayectoria.usecase.ts
│   │   │   └── infrastructure/adapters/
│   │   │       ├── TrajectoryCalculatorAdapter.ts
│   │   │       └── WeatherAdapter.ts
│   │   └── usuarios/                  # Gestión de cuentas de usuario
│   │       ├── domain/
│   │       │   ├── entities/Usuario.ts
│   │       │   ├── ports/forManagingUsuarios.port.ts
│   │       │   └── use-cases/
│   │       │       ├── AprobarCuenta.usecase.ts
│   │       │       ├── CambiarInfoCuenta.usecase.ts
│   │       │       ├── CambiarInfoLogin.usecase.ts
│   │       │       ├── CrearCuenta.usecase.ts
│   │       │       └── EliminarCuenta.usecase.ts
│   │       └── infrastructure/adapters/PrismaUsuarioRepository.ts
│   ├── types/
│   │   ├── clerk.d.ts                 # Tipos globales para Clerk JWT (rol, email)
│   │   └── geometria.ts              # PuntoGeometria (GeoJSON Point)
│   └── generated/prisma/              # Prisma Client generado (autogenerado)
│
├── middleware.ts                      # Clerk middleware (protección de rutas)
├── next.config.ts                     # Next.js config (React Compiler habilitado)
├── package.json                       # Dependencias y scripts
├── postcss.config.mjs                 # PostCSS con Tailwind v4
├── tsconfig.json                      # TypeScript config con path alias @/
├── vitest.config.ts                   # Vitest config con alias @/
├── eslint.config.mjs                  # ESLint flat config
├── AGENTS.md                          # Guía para agentes de IA
├── CLAUDE.md                          # Referencia a AGENTS.md
├── prisma.config.ts                   # Configuración de Prisma
└── project_overview.md                # Este documento

# Documentos externos (raíz del repo)
├── ../diagramaER.md                   # Diagrama Entidad-Relación (Mermaid)
└── ../EsquemaRelacional_y_Relaciones.md  # Esquema relacional detallado
```

---

## 2. Descripción de archivos

### 2.1 Core — Módulos Hexagonales (`src/modules/`)

#### `auth` — Autenticación
| Archivo | Descripción |
|---|---|
| `domain/ports/forAuthenticating.port.ts` | Puerto de salida: define `UsuarioAutenticado` (id, email, rol) y `ForAuthenticating` (obtenerUsuarioActual, cerrarSesion). |
| `domain/use-cases/IniciarSesion.usecase.ts` | Obtiene el usuario autenticado actual desde el puerto. |
| `domain/use-cases/CerrarSesion.usecase.ts` | Delega el cierre de sesión al puerto (Clerk lo maneja del lado cliente). |
| `infrastructure/adapters/ClerkAuthAdapter.ts` | Implementa `ForAuthenticating` usando `@clerk/nextjs/server`. Lee `sessionClaims.metadata.rol` para determinar el rol. |

#### `solicitudes` — Core del negocio (solicitudes de lanzamiento)
| Archivo | Descripción |
|---|---|
| `domain/entities/Solicitud.ts` | Entidad principal: `Solicitud` con id, base, usuario, fechas, estado (`EstadoSolicitud`), prioridad (`Prioridad`), ubicación destino (`PuntoGeometria`). |
| `domain/entities/Paquete.ts` | Entidad `Paquete` asociado a una solicitud (esqueleto). |
| `domain/ports/forManagingSolicitudes.port.ts` | Puerto de salida: `guardar`, `buscarPorId`, `listarPorSolicitante`, `listarTodas`. |
| `domain/use-cases/CrearSolicitud.usecase.ts` | Crea una solicitud con UUID, estado `"creada"`, fecha actual. Inyecta el repo vía constructor. |
| `domain/use-cases/ListarSolicitudesAdmin.usecase.ts` | Lista todas las solicitudes con filtro opcional por estado. |
| `domain/use-cases/{Anular,Cancelar,ConfirmarRecibida,ConsultarSolicitudesPendientes,ConsultarSolicitud,ControlarSolicitud,RegistrarEnCamino,RegistrarEnPreparacion,RegistrarLanzada,RegistrarLista}.usecase.ts` | Casos de uso para el ciclo de vida completo de la solicitud (mayoría esqueletos). |
| `infrastructure/adapters/PrismaSolicitudRepository.ts` | Implementa `ForManagingSolicitudes` con Prisma. Mapea entre el modelo de Prisma y la entidad de dominio (`toDomain`). |
| `infrastructure/adapters/MockSolicitudesRepository.ts` | Implementación en memoria para tests. |
| `domain/use-cases/tests/CrearSolicitud.test.ts` | Test unitario del caso de uso `CrearSolicitud`. |

#### `stock` — Gestión de inventario
| Archivo | Descripción |
|---|---|
| `domain/entities/Stock.ts` | Entidad de inventario (esqueleto). |
| `domain/ports/forManagingStock.port.ts` | Puerto para consultar/actualizar stock (esqueleto). |
| `domain/use-cases/ActualizarStock.usecase.ts` | Actualiza cantidades de stock (esqueleto). |
| `domain/use-cases/ConsultarStock.usecase.ts` | Consulta stock por base (esqueleto). |
| `infrastructure/adapters/PrismaStockRepository.ts` | Adaptador Prisma para stock (esqueleto). |

#### `usuarios` — Gestión de cuentas
| Archivo | Descripción |
|---|---|
| `domain/entities/Usuario.ts` | Entidad de usuario con rol (esqueleto). |
| `domain/ports/forManagingUsuarios.port.ts` | Puerto para CRUD de usuarios (esqueleto). |
| `domain/use-cases/{AprobarCuenta,CambiarInfoCuenta,CambiarInfoLogin,CrearCuenta,EliminarCuenta}.usecase.ts` | Casos de uso de gestión de cuentas (esqueletos). |
| `infrastructure/adapters/PrismaUsuarioRepository.ts` | Adaptador Prisma para usuarios (esqueleto). |

#### `notificaciones` — Sistema de notificaciones
| Archivo | Descripción |
|---|---|
| `domain/ports/forNotifying.port.ts` | Puerto: `notificar({ destinatario, solicitudId, estado })`. |
| `domain/use-cases/Notificar*.usecase.ts` | 9 casos de uso, uno por transición de estado (Asignacion, EnCamino, EnPreparacion, Lanzada, Lista, Recepcion, Rechazo, Anulacion, SolicitudCreada). Los que están implementados siguen el patrón: inyectan `ForNotifying` y llaman a `notifier.notificar()`. |
| `infrastructure/adapters/NotificationServiceAdapter.ts` | Implementación del notificador (esqueleto). |

#### `trayectoria` — Cálculo de trayectoria
| Archivo | Descripción |
|---|---|
| `domain/entities/Trayectoria.ts` | Trayectoria calculada (esqueleto). |
| `domain/ports/forCalculatingTrajectory.port.ts` | Puerto para cálculo de trayectoria (esqueleto). |
| `domain/ports/forGettingWeather.port.ts` | Puerto para obtener datos climáticos (esqueleto). |
| `domain/use-cases/CalcularTrayectoria.usecase.ts` | Calcula punto y momento óptimo de lanzamiento (esqueleto). |
| `infrastructure/adapters/TrajectoryCalculatorAdapter.ts` | Adaptador que delega a servicio externo (esqueleto). |
| `infrastructure/adapters/WeatherAdapter.ts` | Adaptador de clima (esqueleto). |

### 2.2 Composition Root — `src/container.ts`
Único archivo que importa tanto dominio como infraestructura. Instancia los adaptadores concretos y los inyecta en los casos de uso. Actualmente wirea:
- `PrismaSolicitudesRepository` → `CrearSolicitud` y `ListarSolicitudesAdminUseCase`
- `ClerkAuthAdapter` → `IniciarSesion` y `CerrarSesion`

### 2.3 Infraestructura global (`src/infrastructure/`)

| Archivo | Descripción |
|---|---|
| `db/prisma.client.ts` | Singleton de `PrismaClient` con adapter Neon (serverless Postgres). Cachea en `globalThis` para hot reload. |
| `maps/googleMaps.client.ts` | Cliente para Google Maps API (esqueleto). |
| `notifications/notificationClient.ts` | Cliente para envío de notificaciones email (esqueleto). |
| `weather/weatherApi.client.ts` | Cliente para API de clima externa (esqueleto). |

### 2.4 Tipos compartidos (`src/types/`)
| Archivo | Descripción |
|---|---|
| `geometria.ts` | Define `PuntoGeometria` como `{ type: "Point", coordinates: [number, number] }` (formato GeoJSON). |
| `clerk.d.ts` | Extiende `CustomJwtSessionClaims` con `metadata.rol` y `email`. |

### 2.5 Server Actions (`src/actions/`)
| Archivo | Descripción |
|---|---|
| `solicitudes.actions.ts` | Server actions para CRUD de solicitudes (esqueleto). |
| `stock.actions.ts` | Server actions para stock (esqueleto). |
| `usuarios.actions.ts` | Server actions para usuarios (esqueleto). |

### 2.6 App Router — Páginas (`app/`)

#### Layouts y página raíz
| Archivo | Descripción |
|---|---|
| `layout.tsx` | Layout raíz: envuelve toda la app en `ClerkProvider`, importa `globals.css`. |
| `page.tsx` | Redirige a `/api/auth/login`. |

#### Rutas por rol
| Archivo | Descripción |
|---|---|
| `admin/layout.tsx` | Layout del panel admin: sidebar con links a Dashboard y Perfil, `UserButton` de Clerk. |
| `admin/dashboard/page.tsx` | Dashboard admin: tabla de solicitudes con fetch a `/api/admin/solicitudes`, filtro por estado, colores según estado. |
| `admin/perfil/page.tsx` | Página de perfil admin con componente `UserProfile` de Clerk. |
| `admin/usuarios/page.tsx` | Gestión de usuarios (esqueleto). |
| `remitente/dashboard/layout.tsx` | Layout remitente con `DashboardShell`. |
| `remitente/dashboard/page.tsx` | Dashboard remitente (esqueleto). |
| `remitente/solicitudes/page.tsx` | Solicitudes asignadas al remitente (esqueleto). |
| `remitente/stock/page.tsx` | Stock del remitente (esqueleto). |
| `solicitante/dashboard/page.tsx` | Dashboard solicitante (esqueleto). |
| `solicitante/solicitudes/[id]/page.tsx` | Detalle de solicitud (esqueleto). |
| `solicitante/solicitudes/nueva/page.tsx` | Formulario nueva solicitud (esqueleto). |
| `sign-in/[[...sign-in]]/page.tsx` | Login con `SignIn` de Clerk. |
| `sign-up/[[...sign-up]]/page.tsx` | Registro con `SignUp` de Clerk. |

#### API Route Handlers
| Archivo | Descripción |
|---|---|
| `api/admin/solicitudes/route.ts` | `GET` — Lista solicitudes (solo admin). Valida rol en `sessionClaims`, usa `listarSolicitudesAdmin.ejecutar()`. |
| `api/auth/login/route.ts` | `GET` — Obtiene usuario actual y redirige según rol (admin → /admin/dashboard, remitente → /remitente/dashboard, solicitante → /solicitante/dashboard). |
| `api/solicitudes/route.ts` | `POST` — Crea solicitud. Usa `crearSolicitud.ejecutar()` desde container. |
| `api/solicitudes/[id]/route.ts` | `GET` solicitud por ID (esqueleto). |
| `api/solicitudes/[id]/estado/route.ts` | `PATCH` cambiar estado (esqueleto). |
| `api/bases/[id]/stock/route.ts` | `GET` stock de base (esqueleto). |

### 2.7 Componentes de UI (`app/components/ui/`)
| Archivo | Descripción |
|---|---|
| `Button.tsx` | Botón reutilizable con variantes (primary/secondary/danger), tamaños (sm/md/lg), soporte `as="a"`. |
| `Badge.tsx` | Badge con variantes `solicitante`, `remitente`, `default`. |
| `StatusBadge.tsx` | Badge de estado semántico (info/success/warning/danger). |
| `Avatar.tsx` | Avatar con soporte de imagen y fallback de iniciales. |
| `DropdownTrigger.tsx` | Botón dropdown con ícono de chevron. |
| `NavItem.tsx` | Item de navegación con estado activo y badge opcional. |
| `ProgressBar.tsx` | Barra de progreso con variantes de color. |
| `Tabs.tsx` | Componente de tabs con selección y estado disabled. |
| `Logo.tsx` | SVG del logo del proyecto (avión/cohete). |

### 2.8 Componentes de Layout (`app/components/layout/`)
| Archivo | Descripción |
|---|---|
| `DashboardShell.tsx` | Shell reutilizable: Sidebar + TopBar + children. |
| `Sidebar.tsx` | Barra lateral con navegación (Inicio, Mis solicitudes, Asignadas, Historial, Stock, Notificaciones, Perfil, Ayuda). |
| `TopBar.tsx` | Barra superior con saludo, nombre de usuario (Clerk `useUser`), iniciales, notificaciones. |
| `types.ts` | Interfaces `SidebarConfig`, `TopBarConfig`, `DashboardShellProps`. |

### 2.9 Componentes de negocio (`app/components/`)
| Archivo | Descripción |
|---|---|
| `AssignedRequestsTable.tsx` | Tabla de solicitudes asignadas con datos mock, usa `StatusBadge`. |
| `RequestRow.tsx` | Fila individual de solicitud (esqueleto). |
| `StockCard.tsx` | Tarjeta de stock (esqueleto). |
| `CoverageMap.tsx` | Mapa de cobertura (esqueleto). |
| `ActivityStatItem.tsx` | Indicador de actividad (esqueleto). |
| `ActivitySummary.tsx` | Resumen de actividad (esqueleto). |
| `NotificationItem.tsx` | Item de notificación (esqueleto). |
| `NotificationsPanel.tsx` | Panel de notificaciones (esqueleto). |
| `HelpCard.tsx` | Tarjeta de ayuda (esqueleto). |

### 2.10 Configuración
| Archivo | Descripción |
|---|---|
| `middleware.ts` | Clerk middleware. Protege todas las rutas excepto `/sign-in`, `/sign-up`, `/api/auth/login`. |
| `next.config.ts` | Next.js 16 con React Compiler habilitado. |
| `postcss.config.mjs` | PostCSS con plugin `@tailwindcss/postcss` (Tailwind v4). |
| `tsconfig.json` | Path alias `@/*` → `./*`. |
| `vitest.config.ts` | Vitest con alias `@/` → `./src`. |
| `eslint.config.mjs` | ESLint flat config con `eslint-config-next` (core-web-vitals + typescript). |
| `package.json` | Dependencias: Next.js 16, React 19, Clerk, Prisma 7, Neon, Tailwind v4, Vitest. |
| `prisma/schema.prisma` | Schema Prisma con modelo `Solicitud` (id, baseId, usuarioId, fechaSolicitada, estado, prioridad, ubicacionDestino, fechaEntrega, fechaEstimada). Generador apunta a `src/generated/prisma`. |
| `prisma.config.ts` | Configuración adicional de Prisma. |

---

## 3. Dependencias entre módulos

### 3.1 Diagrama de dependencias (arte conceptual)

```
┌─────────────────────────────────────────────────────────┐
│                     APP ROUTER (app/)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Admin   │  │ Remitente│  │ Solicitante          │   │
│  │  pages   │  │  pages   │  │ pages                │   │
│  └────┬─────┘  └────┬─────┘  └─────────┬────────────┘   │
│       │              │                 │                 │
│  ┌────▼──────────────▼─────────────────▼───────────┐    │
│  │           API Route Handlers                     │    │
│  │  /api/admin/solicitudes  /api/solicitudes        │    │
│  │  /api/auth/login         /api/bases/[id]/stock   │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                   │
└───────────────────────┼───────────────────────────────────┘
                        │
            ┌───────────▼───────────┐
            │   COMPOSITION ROOT    │
            │   src/container.ts    │
            │   (wires adapters →   │
            │    use cases)         │
            └───┬───────┬───────┬──┘
                │       │       │
   ┌────────────▼──┐ ┌──▼────┐ ┌▼────────────┐
   │ Solicitudes   │ │ Auth  │ │ (futuro:    │
   │ UseCases      │ │ UC    │ │  stock,     │
   │               │ │       │ │  usuarios,  │
   │ CrearSolicitud│ │Iniciar│ │  notif,     │
   │ ListarAdmin   │ │Sesion │ │  trayector) │
   └───┬───────────┘ └───┬───┘ └─────────────┘
       │                 │
       │ (ports)         │ (ports)
       ▼                 ▼
   ┌────────────┐  ┌──────────┐
   │ ForManaging│  │ ForAuth- │
   │ Solicitudes│  │ enticating│
   │ .port.ts   │  │ .port.ts │
   └───┬────────┘  └───┬──────┘
       │                │
       │ (implements)   │ (implements)
       ▼                ▼
   ┌────────────────┐ ┌──────────────┐
   │PrismaSolicitud │ │ClerkAuth     │
   │Repository      │ │Adapter       │
   └───────┬────────┘ └──────────────┘
           │
           ▼
   ┌────────────────┐
   │  Prisma Client  │
   │ (Postgres/Neon) │
   └────────────────┘
```

### 3.2 Matriz de dependencias

| Módulo | Depende de (puertos) | Es implementado por |
|---|---|---|
| **solicitudes** | `ForManagingSolicitudes` (port) | `PrismaSolicitudRepository`, `MockSolicitudesRepository` |
| **auth** | `ForAuthenticating` (port) | `ClerkAuthAdapter` |
| **notificaciones** | `ForNotifying` (port) | `NotificationServiceAdapter` |
| **stock** | `ForManagingStock` (port) | `PrismaStockRepository` |
| **usuarios** | `ForManagingUsuarios` (port) | `PrismaUsuarioRepository` |
| **trayectoria** | `forCalculatingTrajectory`, `forGettingWeather` | `TrajectoryCalculatorAdapter`, `WeatherAdapter` |

### 3.3 Reglas de arquitectura

- **Dominio NO importa infraestructura.** Los casos de uso solo conocen interfaces (puertos).
- **Los adaptadores implementan los puertos.**
- **Container.ts es el único punto de wiring** — solo él conoce ambas caras.
- **Las páginas y API routes del App Router** usan los casos de uso ya wireados desde container.ts.

---

## 4. Flujo principal de ejecución

### 4.1 Ciclo de autenticación y redirección

```
Usuario no autenticado
        │
        ▼
GET /  ──────────────────────────►  redirect(/api/auth/login)
                                         │
                                    ClerkAuthAdapter
                                    .obtenerUsuarioActual()
                                         │
                           ┌─────────────┴─────────────┐
                           │        ¿Usuario?           │
                           │       autenticado?         │
                           └─────────────┬─────────────┘
                          No             │           Sí
                           │             │
                           ▼             ▼
                    redirect(/sign-in)   ┌────────────────────┐
                    (Clerk login page)   │ Leer rol de        │
                                         │ sessionClaims      │
                                         │ .metadata.rol      │
                                         └────────┬───────────┘
                                  ┌────────────────┼────────────────┐
                                  ▼                ▼                ▼
                           admin?            remitente?        solicitante?
                              │                  │                  │
                              ▼                  ▼                  ▼
                    /admin/dashboard   /remitente/dashboard  /solicitante/dashboard
```

### 4.2 Creación de una solicitud (POST /api/solicitudes)

```
Cliente (frontend)
      │
      │ POST /api/solicitudes
      │ body: { id_base, id_usuario, prioridad, ubicacion_destino, fecha_entrega }
      ▼
app/api/solicitudes/route.ts
      │
      │ 1. Lee body del request
      │ 2. Llama a crearSolicitud.ejecutar(datos)
      ▼
src/container.ts → CrearSolicitud (inyectado con PrismaSolicitudesRepository)
      │
      │ 1. Construye entidad Solicitud con:
      │    - id_solicitud: crypto.randomUUID()
      │    - estado: "creada"
      │    - fecha_solicitada: new Date()
      │    - fecha_estimada: datos.fecha_entrega
      │ 2. Llama a this.repo.guardar(solicitud)
      ▼
PrismaSolicitudesRepository.guardar()
      │
      │ 1. prisma.solicitud.upsert({ where: { id }, create: { ... }, update: { estado } })
      ▼
      Postgres (Neon)
      │
      │ Devuelve la solicitud creada
      ▼
Response.json(solicitud, { status: 201 })
```

### 4.3 Listado de solicitudes (admin)

```
AdminDashboard (componente React)
      │
      │ useEffect → GET /api/admin/solicitudes?estado=...
      ▼
app/api/admin/solicitudes/route.ts
      │
      │ 1. await auth() → verifica sessionClaims.metadata.rol === 'admin'
      │ 2. Lee query param ?estado=
      │ 3. Llama a listarSolicitudesAdmin.ejecutar(estado)
      ▼
ListarSolicitudesAdminUseCase
      │
      │ this.solicitudRepository.listarTodas(estado)
      ▼
PrismaSolicitudesRepository.listarTodas(estadoFiltro?)
      │
      │ prisma.solicitud.findMany({ where: estado ? { estado } : {}, orderBy: fechaSolicitada: "desc" })
      │ .map(row → this.toDomain(row))
      ▼
      JSON → componente AdminDashboard
      │ Renderiza tabla con colores según estado
```

### 4.4 Ciclo de vida de una solicitud (flujo de estados)

```
                    ┌──────────┐
                    │ CREADA   │ ← POST /api/solicitudes
                    └────┬─────┘
                         │ (admin asigna remitente)
                    ┌────▼─────┐
                    │ ASIGNADA │
                    └────┬─────┘
                         │ (remitente prepara)
                    ┌──────────▼──────┐
                    │ EN_PREPARACION  │ ← NotificarEnPreparacion
                    └──────────┬──────┘
                               │ (preparación lista)
                         ┌─────▼──────┐
                         │ LISTA      │ ← NotificarLista
                         └─────┬──────┘
                               │ (en vuelo)
                         ┌─────▼──────┐
                         │ EN_CAMINO  │ ← NotificarEnCamino
                         └─────┬──────┘
                               │ (paquete lanzado)
                         ┌─────▼──────┐
                         │ LANZADA    │ ← NotificarLanzada
                         └─────┬──────┘
                               │ (recibido por solicitante)
                         ┌─────▼──────────┐
                         │ COMPLETADA     │ ← NotificarRecepcion
                         └────────────────┘

    Estados terminales alternativos:
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │CANCELADA  │   │RECHAZADA  │   │ANULADA    │
    └───────────┘   └───────────┘   └───────────┘
```

---

## 5. Resumen de la arquitectura utilizada

### 5.1 Arquitectura: Hexagonal (Ports & Adapters)

El proyecto implementa **Arquitectura Hexagonal** (también conocida como Puertos y Adaptadores), que separa el código en tres capas concéntricas:

```
┌─────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA                   │
│  (Adaptadores driven: Prisma, Clerk, APIs externas)  │
│  ┌───────────────────────────────────────────────┐  │
│  │                 DOMINIO                       │  │
│  │  (Entidades, Puertos, Casos de Uso)          │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           NO DEPENDE DE NADA            │  │  │
│  │  │          (código puro TypeScript)        │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  (Adaptadores driver: Route Handlers, Server Actions)│
└─────────────────────────────────────────────────────┘
```

**Principios clave:**

1. **El dominio es el centro** — No importa ningún framework, librería externa, base de datos o API. Solo TypeScript puro.
2. **Los puertos** (`forXxx.port.ts`) son interfaces que definen lo que el dominio necesita del mundo exterior.
3. **Los adaptadores** implementan esas interfaces. Son reemplazables sin tocar el dominio.
4. **Dependency inversion**: el dominio define el contrato; la infraestructura lo cumple.
5. **Único punto de wiring**: `src/container.ts` es el composition root.

### 5.2 Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 16.2.6 (React 19.2.4) |
| **Lenguaje** | TypeScript 5 |
| **Autenticación** | Clerk (`@clerk/nextjs`) con JWT metadata para roles |
| **ORM** | Prisma 7 (con driver adapter Neon serverless) |
| **Base de datos** | PostgreSQL (Neon serverless) |
| **CSS** | Tailwind CSS v4 (vía `@tailwindcss/postcss`) |
| **Testing** | Vitest |
| **Linting** | ESLint (flat config, `eslint-config-next`) |
| **Compilador** | React Compiler (habilitado en `next.config.ts`) |

### 5.3 Patrones y decisiones de diseño

| Patrón | Uso |
|---|---|
| **Ports & Adapters** | Todos los módulos bajo `src/modules/` |
| **Composition Root** | `src/container.ts` |
| **Singleton** | `prisma.client.ts` (cacheado en `globalThis`) |
| **Server Actions** | Alternativa ligera a API routes (en `src/actions/`) |
| **Route Groups** | `(admin)/`, `(remitente)/`, `(solicitante)/` en App Router |
| **UUID** | Generación de IDs con `crypto.randomUUID()` |
| **GeoJSON** | `PuntoGeometria` como `{ type: "Point", coordinates: [lng, lat] }` |

### 5.4 Estado del proyecto

| Aspecto | Estado |
|---|---|
| **Módulo auth** | ✓ Funcional (Clerk, login, logout, roles) |
| **Módulo solicitudes** | ◐ Parcial (Crear + ListarAdmin implementados; el resto esqueletos) |
| **Módulo stock** | ◐ Esqueleto (puerto y caso de uso definidos sin implementación) |
| **Módulo usuarios** | ◐ Esqueleto |
| **Módulo notificaciones** | ◐ Parcial (8 casos de uso implementados, falta adaptador concreto) |
| **Módulo trayectoria** | ◐ Esqueleto |
| **Páginas admin** | ✓ Dashboard funcional, Perfil funcional |
| **Páginas remitente** | ◐ Layout + DashboardShell funcional, páginas esqueleto |
| **Páginas solicitante** | ◐ Esqueletos |
| **Componentes UI** | ✓ 8 componentes implementados + tests + demos |
| **Base de datos** | ◐ Schema Prisma creado con modelo Solicitud; faltan modelos restantes |
| **Server Actions** | ◐ Esqueletos |
| **Prisma Client** | ✓ Generado con driver adapter Neon |
| **Tests** | ◐ 8 tests de UI + 1 test de caso de uso (`CrearSolicitud`) |

### 5.5 Convenciones del proyecto

- **Nombrado de archivos:** `VerboSustantivo.usecase.ts`, `forGerundio.port.ts`, `PrismaXxxRepository.ts`
- **Idioma:** Español para nombres de dominio, entidades, rutas, comentarios
- **Roles de usuario:** `admin`, `remitente`, `solicitante` (vía `sessionClaims.metadata.rol`)
- **Estados de solicitud:** `creada → asignada → en_preparacion → lista → en_camino → lanzada → completada` (terminales: `cancelada`, `rechazada`, `anulada`)
- **Path alias:** `@/*` mapea a `./*` (raíz del proyecto) — NO `./src/*`

---

*Documento generado el 2026-06-12 basado en la revisión completa del código fuente.*
