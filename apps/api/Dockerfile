# Base
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies (solo api + deps)
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# 👇 CLAVE: instalar SOLO el workspace api
RUN pnpm install --filter api... --frozen-lockfile \
 && pnpm -C apps/api prisma:generate

# Dev
FROM deps AS dev
COPY . .
WORKDIR /app/apps/api
EXPOSE 4000
# Aplicar migraciones nuevas en desarrollo y arrancar en modo watch.
CMD ["sh", "-c", "pnpm prisma:migrate && pnpm dev"]

# Build
FROM deps AS build
COPY . .
WORKDIR /app/apps/api
RUN pnpm build

# Prod
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=deps /app/apps/api/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/prisma ./prisma

EXPOSE 4000
# Aplicar migraciones pendientes en un entorno de producción antes de arrancar la API.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema ./prisma/schema.prisma && node dist/main.js"]
