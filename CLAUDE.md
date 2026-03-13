# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**APPBASE** is a modular intranet platform for SMBs, built as a pnpm monorepo. All infrastructure runs in Docker. Current modules: Tickets, Docs, IT Assets.

## Monorepo Structure

```
apps/
  api/   — NestJS backend (@app/api), port 4000
  web/   — Vue 3 + Vite frontend (@app/web), port 5173
packages/
  shared/ — Shared code (@app/shared), currently a stub
infra/
  nginx/ — Nginx reverse proxy config (port 8080)
```

## Commands

Run from the repo root unless otherwise noted.

### Full stack (Docker)
```bash
docker compose up               # Start all services
docker compose up -d db redis   # Start only DB + Redis (for local dev without Docker API)
```

### API (from `apps/api/`)
```bash
pnpm dev                        # Start NestJS in watch mode
pnpm build                      # Compile TypeScript
pnpm typecheck                  # Type-check without emit
```

### Web (from `apps/web/`)
```bash
pnpm dev                        # Start Vite dev server
pnpm build                      # Production build
pnpm typecheck                  # vue-tsc --noEmit
```

### Root-level shortcuts
```bash
pnpm dev          # Run all apps in parallel
pnpm build        # Build all apps
pnpm typecheck    # Typecheck all apps
```

### Database (from `apps/api/`)
```bash
pnpm prisma:generate            # Regenerate Prisma client after schema changes
pnpm prisma:migrate:create      # Create a new migration (dev)
pnpm prisma:migrate:deploy      # Apply pending migrations (prod/CI)
pnpm prisma:migrate:status      # Check migration status
pnpm prisma:studio              # Open Prisma Studio at localhost:5555
pnpm seed                       # Build + run bootstrap/seed.ts
```

## Architecture

### Multi-tenancy
Every request must carry `x-tenant-id` and `x-user-id` HTTP headers. `ContextMiddleware` reads these and stores them in an `AsyncLocalStorage`-backed `RequestContextService` that is accessible anywhere in the request lifecycle without passing the context explicitly.

**Guards (apply in this order):**
1. `TenantGuard` — validates `x-tenant-id` is present
2. `ModuleEnabledGuard` — checks the tenant has an active subscription for the required module (decorated with `@RequiredModule('module-id')`)
3. `PermissionsGuard` — checks the user has all required permission codes (decorated with `@RequirePermissions(...)`)

### RBAC
Permissions are code-constants defined in `apps/api/src/rbac/permissions.constants.ts`. They must be seeded into the DB before they can be assigned. The seed script syncs all permission codes on every run. Permission codes follow the pattern `RESOURCE_ACTION` (e.g., `USER_CREATE`, `ROLE_ASSIGN`).

### Module Registry
Available modules are defined in `MODULE_CATALOG` inside `apps/api/src/modules-registry/modules-registry.service.ts`. A `ModuleSubscription` record in the DB controls per-tenant module access. To add a new module, add its entry to `MODULE_CATALOG` — no schema changes are needed.

### Soft Deletes
All entities use `deletedAt DateTime?`. Queries must always filter `where: { deletedAt: null }` to exclude soft-deleted records.

### Environment Variables (`apps/api/.env`)
Validated at startup with Zod in `apps/api/src/config/env.schema.ts`:
- `NODE_ENV` (required)
- `DATABASE_URL` (required)
- `REDIS_URL` (optional)
- `CORS_ORIGINS` (optional)
- `PORT` (default: 4000)

Copy `apps/api/.env.example` to `apps/api/.env` to get started.

### Seed Bootstrap
`apps/api/src/bootstrap/seed.ts` is idempotent — safe to re-run. It creates:
- Demo tenant (`Demo`, ACTIVE)
- Admin role with all permissions
- Demo admin user (`admin@demo.com`)
- All base modules enabled (tickets, docs, it-assets)
