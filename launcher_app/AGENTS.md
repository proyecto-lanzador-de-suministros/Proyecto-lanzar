<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project overview

Package-delivery launcher app (university project). Domain language is **Spanish** — entity names, routes, use cases, and comments use Spanish terms (solicitudes, remitente, solicitante, stock, trayectoria, notificaciones).

## Architecture: Hexagonal (Ports & Adapters)

Every module under `src/modules/` follows the same structure:
```
module/
  domain/
    entities/       # Core domain types
    ports/          # Interfaces the domain depends on (forXxx.port.ts)
    use-cases/      # Business logic (XxxYyy.usecase.ts)
  infrastructure/
    adapters/       # Concrete implementations (PrismaXxxRepository.ts, XxxAdapter.ts)
```

Modules: `auth`, `solicitudes`, `stock`, `usuarios`, `trayectoria`, `notificaciones`.

- **Composition root**: `src/container.ts` — only file that wires adapters to use cases.
- **Domain must not import infrastructure.** Ports define the boundary.
- **Infrastructure adapters** live in `src/infrastructure/` (db, maps, notifications, trajectory, weather) and inside each module's `infrastructure/adapters/`.

## Route structure (two `app/` dirs — this matters)

- `app/` (project root) — **the real app**. Contains route groups by role:
  - `(admin)/` — admin dashboard, user management
  - `(remitente)/` — sender dashboard, stock, assigned requests
  - `(solicitante)/` — requester dashboard, create/view requests
  - `api/` — API route handlers
- `src/app/` — **leftover from create-next-app boilerplate**. Do not add real routes here.

## Commands

All from `launcher_app/`:
```bash
npm run dev      # Dev server on :3000
npm run build    # Production build
npm run lint     # ESLint (flat config, eslint-config-next)
```

No test runner is configured yet. No typecheck script (use `npx tsc --noEmit`).

## Key tech

- Next.js 16.2.6, React 19, TypeScript 5
- Tailwind CSS v4 (PostCSS plugin via `@tailwindcss/postcss`)
- React Compiler enabled (`reactCompiler: true` in `next.config.ts`)
- Prisma (client singleton at `src/infrastructure/db/prisma.client.ts`, no schema file yet)
- Path alias: `@/*` → `./src/*`

## Conventions

- Use cases: `VerbNoun.usecase.ts` (e.g., `CrearSolicitud.usecase.ts`)
- Ports: `forGerund.port.ts` (e.g., `forManagingSolicitudes.port.ts`)
- Adapters: `PrismaXxxRepository.ts` or `XxxAdapter.ts`
- Server actions in `src/actions/` are an alternative to API route handlers for client-side CRUD
- ER diagram and relational schema docs live at repo root (`diagramaER.md`, `EsquemaRelacional_y_Relaciones.md`)
