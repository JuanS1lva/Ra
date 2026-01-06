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
---

### Activar Corepack (una sola vez)
```bash
corepack enable
```

---

## Setup inicial (primer ciclo)

Para la primera configuración del proyecto, ejecuta estos comandos en orden:

```bash
# 1. Iniciar servicios de base de datos (PostgreSQL y Redis)
docker compose up -d db redis

# 2. Generar el cliente de Prisma
docker compose exec api pnpm prisma:generate

# 3. Aplicar migraciones iniciales
docker compose exec api pnpm prisma:migrate:deploy

# 4. Poblar la base de datos con datos iniciales (seed)
docker compose exec api pnpm seed
```

> **Nota**: Estos comandos solo son necesarios la primera vez. En ciclos posteriores, las migraciones y el cliente de Prisma se generan automáticamente al iniciar los contenedores.

---
### Migraciones de Prisma

Prisma gestiona el esquema de la base de datos y las migraciones. Todos los comandos deben ejecutarse desde el directorio `apps/api`.

#### Generar el cliente de Prisma

Después de modificar el esquema (`apps/api/prisma/schema.prisma`), genera el cliente de Prisma:

```bash
cd apps/api
pnpm prisma:generate
```

#### Crear una nueva migración

Cuando modifiques el esquema de Prisma, crea una nueva migración:

```bash
cd apps/api
pnpm prisma:migrate:create
```

Este comando:
- Detecta los cambios en el esquema
- Crea un archivo de migración SQL en `apps/api/prisma/migrations/`
- Aplica la migración a la base de datos de desarrollo
- Regenera automáticamente el cliente de Prisma

**Nota**: En desarrollo con Docker, las migraciones se aplican automáticamente al iniciar el contenedor.

#### Verificar el estado de las migraciones

Para ver qué migraciones están aplicadas y cuáles están pendientes:

```bash
cd apps/api
pnpm prisma:migrate:status
```

#### Aplicar migraciones en producción

En entornos de producción, usa el comando de deploy (no modifica el esquema, solo aplica migraciones pendientes):

```bash
cd apps/api
pnpm prisma:migrate:deploy
```

**Nota**: En producción con Docker, las migraciones se aplican automáticamente antes de iniciar la API.

#### Abrir Prisma Studio

Para visualizar y editar datos de la base de datos de forma interactiva:

```bash
cd apps/api
pnpm prisma:studio
```

Esto abrirá Prisma Studio en `http://localhost:5555` (por defecto).

#### Flujo de trabajo recomendado

1. **Modificar el esquema**: Edita `apps/api/prisma/schema.prisma`
2. **Crear migración**: `pnpm prisma:migrate:create`
3. **Revisar la migración**: Verifica el SQL generado en `prisma/migrations/`
4. **En desarrollo**: Las migraciones se aplican automáticamente al iniciar Docker y si no, correr `pnpm prisma:migrate:deploy`
5. **En producción**: Las migraciones se aplican automáticamente antes de iniciar la API
