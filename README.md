# Ra
Everything is possible.

# Intranet Platform (Monorepo)

Plataforma tipo intranet para pymes, con módulos base (TI, Docs, Tickets) y arquitectura modular para añadir módulos especializados por empresa.  
Entorno 100% local en Docker, preparado para desplegarse en AWS en el futuro.

---

## Stack

**Monorepo**
- pnpm workspaces

**Backend**
- Node.js + NestJS
- PostgreSQL (Docker)
- Redis (Docker) (jobs/colas, opcional pero recomendado)

**Frontend**
- Vue 3 + Vite

**Proxy**
- Nginx (Docker) para enrutar Web y API

---

## Requisitos

### Software
- **Docker Desktop** (obligatorio)
- **Node.js**: `20.x` (LTS recomendado)
- **pnpm**: gestionado por `corepack`

> Nota: aunque todo corre en Docker, se recomienda tener Node 20 local para tooling, linters, scripts y edición.  
> La imagen Docker también usa Node 20.

### Activar Corepack (una sola vez)
```bash
corepack enable