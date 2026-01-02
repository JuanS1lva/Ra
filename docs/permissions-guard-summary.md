# Corrección en los guardias de permisos y tenant

- **Permisos y tenant desde headers**: Ahora `TenantGuard` y `PermissionsGuard` usan los encabezados `x-tenant-id` y `x-user-id` como respaldo cuando el `RequestContext` no está disponible. Esto evita falsos 403 cuando el contexto asincrónico no se inicializa.
- **Validación consistente**: Si falta cualquiera de los encabezados requeridos, los guardias responden con los errores estándar (`BadRequest` para tenant, `Forbidden` para permisos).
- **Compatibilidad con soft delete**: La resolución de usuario, roles y permisos ignora registros con `deletedAt`, asegurando que solo se consideren entidades activas al autorizar.
