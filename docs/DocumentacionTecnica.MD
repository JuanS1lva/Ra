

# 📘 Especificación Técnica – APPBASE

## 1. Visión general

**APPBASE** es una aplicación modular tipo intranet orientada a **pymes**, diseñada para centralizar la gestión administrativa (TI, documentos, tickets, etc.) y escalar mediante módulos especializados según el enfoque de cada empresa.

La plataforma está diseñada como un **monolito modular**, preparada para evolucionar sin refactorizaciones drásticas hacia escenarios más complejos (corporaciones, microservicios, integraciones externas).

---

## 2. Objetivos técnicos

- Arquitectura monolito modular (no microservicios prematuros)
- Multi-tenant desde el día 1
- Backend desacoplado, tipado y testeable
- Frontend SPA moderno y extensible
- Entorno 100% Docker para desarrollo
- Escalabilidad futura sin rediseño estructural
- Base sólida para automatizaciones y módulos vendibles

---

## 3. Stack tecnológico

### Backend
- Node.js **20.x (LTS)**
- NestJS
- Prisma ORM
- PostgreSQL
- Redis (colas / jobs)
- pnpm (monorepo workspaces)

### Frontend
- Vue 3
- Vite
- Pinia
- Vue Router

### Infraestructura
- Docker
- Docker Compose
- Nginx (reverse proxy)
- Preparado para AWS (ECS / EC2 / RDS / S3)

---

## 4. Arquitectura general

### 4.1 Tipo de arquitectura
- Monolito modular
- Separación clara por dominios
- Cada módulo es:
  - independiente
  - activable por tenant
  - protegido por permisos

### 4.2 Multi-tenancy
- Todas las entidades persistentes incluyen `tenantId`
- El `tenantId` proviene del contexto autenticado
- No existen datos globales sin contexto

> Diseño futuro:
> - `tenant` = corporación
> - `org` = empresa/unidad (no implementado aún)

---

## 5. Monorepo – Estructura

```txt
apps/
  api/        # Backend NestJS
  web/        # Frontend Vue 3
packages/
  shared/     # Tipos y contratos compartidos
infra/
  nginx/      # Reverse proxy
docs/
  DocumentacionTecnica.MD
```

---

## 6. Backend – NestJS

### 6.1 Organización por capas

Cada módulo sigue estrictamente:

```
Controller → Service → Repository → Prisma
```

- **Controller**: HTTP, DTOs, Guards
- **Service**: lógica de negocio
- **Repository**: queries Prisma
- **Prisma**: acceso a base de datos

No se mezcla lógica HTTP con lógica de negocio.

---

### 6.2 Módulos Core

#### 6.2.1 Tenants
Gestión de empresas (pymes).

Endpoints:
- `POST /tenants`
- `GET /tenants/me`
- `PATCH /tenants/me`

---

#### 6.2.2 Users
Usuarios dentro de un tenant.

Endpoints:
- `POST /users`
- `GET /users`
- `PATCH /users/:id`

Reglas:
- Email único por tenant
- Usuarios pueden deshabilitarse

---

#### 6.2.3 RBAC (Roles & Permissions)
Control de acceso basado en roles.

- Permisos con formato:
  ```
  <module>.<action>
  ```
- Ejemplos:
  - `tickets.read`
  - `docs.write`
  - `it.manage`

Entidades:
- Role
- Permission
- UserRole
- RolePermission

---

#### 6.2.4 Modules Registry
Sistema que permite activar/desactivar módulos por tenant.

- Catálogo definido en código
- Persistencia en `module_subscriptions`
- Guard que bloquea endpoints si el módulo no está activo

---

#### 6.2.5 Audit
Auditoría automática de acciones relevantes.

Registra:
- usuario
- acción
- entidad
- timestamp
- correlationId

---

#### 6.2.6 Files
Gestión de archivos y adjuntos.

- Local storage en desarrollo
- Preparado para S3 en producción
- Descargas seguras

---

#### 6.2.7 Notifications
Notificaciones internas (in-app).

Eventos:
- ticket asignado
- ticket actualizado
- vencimientos

---

#### 6.2.8 Auth
Autenticación desacoplada.

Inicial:
- Headers de desarrollo:
  - `x-tenant-id`
  - `x-user-id`

Futuro:
- Google OAuth
- Usuario/contraseña
- Auth0 u otro proveedor externo

---

## 7. Módulos Feature (vendibles)

### 7.1 Tickets
Primer módulo funcional del producto.

Funcionalidad:
- creación y edición de tickets
- asignación
- estados
- prioridades
- comentarios
- historial de cambios

Permisos:
- `tickets.read`
- `tickets.write`
- `tickets.assign`
- `tickets.comment`
- `tickets.manage`

---

### 7.2 Docs
Gestión documental.

Funcionalidad:
- carpetas
- documentos
- versionado simple
- permisos por rol

---

### 7.3 IT Assets
Inventario de activos TI.

Funcionalidad:
- activos
- asignaciones
- historial
- alertas de vencimiento

---

## 8. Request Context

Cada request tiene un contexto común:

- `tenantId`
- `userId`
- `correlationId`

Implementación:
- Middleware con `AsyncLocalStorage`
- Decoradores:
  - `@TenantId()`
  - `@UserId()`

---

## 9. Guards y seguridad

Guards estándar:
- TenantGuard
- PermissionsGuard
- ModuleEnabledGuard

Decoradores:
- `@RequirePermissions([...])`
- `@Module('tickets')`

---

## 10. Base de datos (Prisma)

### 10.1 Reglas generales
- Todas las tablas incluyen `tenantId` cuando aplica
- Índices compuestos `(tenantId, campo)`
- No existen claves únicas globales sin `tenantId`

### 10.2 Tablas base (MVP)
- tenants
- users
- roles
- permissions
- module_subscriptions
- audit_logs
- files
- notifications
- tickets
- ticket_comments
- ticket_status_history

---

## 11. Frontend – Vue 3

### 11.1 Enfoque
- SPA
- Router dinámico según módulos y permisos
- Layout único con sidebar

---

### 11.2 Estructura

```txt
src/
  api/        # llamadas HTTP por dominio
  store/      # Pinia stores
  router/     # rutas y guards
  layouts/    # AppShell, AuthLayout
  pages/      # vistas por módulo
```

---

### 11.3 Stores clave
- auth
- tenant
- modules
- rbac

---

## 12. Flujo de desarrollo recomendado

1. Backend Core
2. Backend Tickets completo
3. Frontend infraestructura base
4. Tickets UI
5. Docs / IT Assets
6. Autenticación real
7. Automatizaciones y reportes

---

## 13. Uso de IA (Antigravity, Codex, etc.)

Las tareas deben pedirse de forma **atómica**, por ejemplo:

- Crear módulo `TicketsModule` con controller/service/repository
- Diseñar schema Prisma para tickets
- Crear guard de permisos
- Crear `TicketsList.vue` consumiendo API existente

Codex **no debe inventar contratos**:  
los endpoints y DTOs deben seguir esta especificación.

---

## 14. Preparación para AWS (futuro)

- API: contenedor Docker
- DB: RDS PostgreSQL
- Files: S3
- Frontend: build estático + CDN
- Secrets: AWS Secrets Manager

No se requieren cambios estructurales.

---

## 15. Estado del documento

- Documento vivo
- Referencia principal del proyecto
- Se actualiza al agregar módulos o cambiar arquitectura

---

**Fin de la especificación técnica**