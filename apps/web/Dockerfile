# Base
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies (solo web + deps)
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

# 👇 CLAVE: instalar SOLO el workspace web
RUN pnpm install --filter web... --frozen-lockfile

# Dev
FROM deps AS dev
COPY . .
WORKDIR /app/apps/web
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Build
FROM deps AS build
COPY . .
WORKDIR /app/apps/web
RUN pnpm build

# Prod
FROM nginx:alpine AS prod
COPY --from=build /app/apps/web/dist /usr/share/nginx/html