# API service

## Probar el contexto de request

El middleware de contexto expone `tenantId` y `userId` a través del endpoint de ejemplo `/context`.

Asegúrate de tener la API en marcha (por defecto en el puerto 4000) y ejecuta:

```bash
curl -X GET \
  -H "x-tenant-id: demo-tenant" \
  -H "x-user-id: demo-user" \
  http://localhost:4000/context
```

La respuesta debería incluir los IDs suministrados y la nota del endpoint de ejemplo.

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
