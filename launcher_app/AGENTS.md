<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

Domain language is **Spanish** — entity names, routes, use cases use Spanish terms (solicitudes, remitente, solicitante, stock, trayectoria, notificaciones). University project: package-delivery launcher app.

## Architecture: Hexagonal (Ports & Adapters)

Each module under `src/modules/`:
```
module/
  domain/{entities,ports,use-cases}/
  infrastructure/adapters/
```
Modules: `auth`, `solicitudes`, `stock`, `usuarios`, `trayectoria`, `notificaciones`.

- **Composition root**: `src/container.ts` — only file that wires adapters to use cases.
- **Domain must not import infrastructure.** Ports define the boundary.
- Shared infra adapters at `src/infrastructure/` (`db/`, `maps/`, `notifications/`, `weather/`).

## Routes

- `app/` — real app routes. Plain directories, no route groups: `admin/`, `remitente/`, `solicitante/`, `api/`, `sign-in/`, `sign-up/`.
- `src/app/` — does **not** exist. Do not create it.

## Commands (from `launcher_app/`)

```bash
npm run dev           # Dev :3000
npm run build         # prisma generate && next build
npm run lint          # ESLint flat config
npm run test          # Vitest
npx tsc --noEmit      # Typecheck (no npm script)
```

## Key tech

- **Next.js 16.2.6** — read `node_modules/next/dist/docs/` before coding. React 19, TS 5, React Compiler on.
- **Tailwind v4** — PostCSS plugin `@tailwindcss/postcss`, no `tailwind.config`.
- **Prisma 7** — schema at `prisma/schema.prisma`, client generated to `src/generated/prisma/`. Uses Neon driver adapter (serverless Postgres). Build runs `prisma generate` first.
- **Path alias** `@/*` → project root (`./*`), **not** `./src/*`. Vitest maps `@/` → `./src` — mismatch exists.
- **Auth** — Clerk middleware protects all routes except `/sign-in`, `/sign-up`, `/api/auth/login`. Roles (admin/remitente/solicitante) via `sessionClaims.metadata.rol`.

## Conventions

- Use cases: `VerbNoun.usecase.ts` (e.g., `CrearSolicitud.usecase.ts`)
- Ports: `forGerund.port.ts` (e.g., `forManagingSolicitudes.port.ts`)
- Adapters: `PrismaXxxRepository.ts` or `XxxAdapter.ts`
- Server actions in `src/actions/` complement API route handlers
- ER docs at repo root: `diagramaER.md`, `EsquemaRelacional_y_Relaciones.md`
- Component tests: `app/components/ui/tests/` (Vitest)

## Gotchas

- `@/*` resolves differently between Next.js (`./*`) and Vitest (`./src/*`) — test imports may break in-app and vice versa.
- Build requires `prisma generate` before `next build` (automated in `npm run build`).
- No typecheck npm script — use `npx tsc --noEmit`.
- `.env` contains real production Clerk keys — treat with care.
