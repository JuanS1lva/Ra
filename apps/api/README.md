# API service

## Health

La API expone varios endpoints de health check para monitoreo y verificación del estado del servicio.

### GET `/health`

Endpoint básico de salud que indica que el servicio está funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Ejemplo:**
```bash
curl http://localhost:4000/health
```

### GET `/ready`

Endpoint de readiness que verifica si el servicio está listo para recibir tráfico. Actualmente retorna un estado básico, pero está planificado para incluir validaciones de conectividad con Prisma.

**Respuesta:**
```json
{
  "status": "ok",
  "service": "api",
  "ready": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "note": "TODO: Replace with Prisma readiness check"
}
```

**Ejemplo:**
```bash
curl http://localhost:4000/ready
```

### GET `/context`

Endpoint de ejemplo que demuestra el uso del contexto de request (tenant y usuario). Requiere autenticación mediante headers.

El middleware de contexto expone `tenantId` y `userId` a través del endpoint de ejemplo `/context`.

**Headers requeridos:**
- `x-tenant-id`: ID del tenant
- `x-user-id`: ID del usuario (opcional)

**Respuesta:**
```json
{
  "tenantId": "demo-tenant",
  "userId": "demo-user",
  "note": "Example endpoint using request context"
}
```

**Ejemplo:**
```bash
curl -X GET \
  -H "x-tenant-id: demo-tenant" \
  -H "x-user-id: demo-user" \
  http://localhost:4000/context
```

## Correlación y formato de errores

Las respuestas incluyen `x-correlation-id` en el header. Puedes enviarlo tú mismo o dejar que la API genere uno automáticamente. Ejemplo con un `correlationId` personalizado:

```bash
curl -i \
  -H "x-tenant-id: demo-tenant" \
  -H "x-user-id: demo-user" \
  -H "x-correlation-id: demo-cid-123" \
  http://localhost:4000/context
```

Los errores se devuelven con el formato:

```json
{
  "code": "BAD_REQUEST",
  "message": "Validation failed",
  "details": { /* opcional, según el error */ },
  "correlationId": "demo-cid-123"
}
```
