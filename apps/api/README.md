# API service

## Probar el contexto de request

El middleware de contexto expone `tenantId` y `userId` a través del endpoint de ejemplo `/context`.

Asegúrate de tener la API en marcha (por defecto en el puerto 3000) y ejecuta:

```bash
curl -X GET \
  -H "x-tenant-id: demo-tenant" \
  -H "x-user-id: demo-user" \
  http://localhost:3000/context
```

La respuesta debería incluir los IDs suministrados y la nota del endpoint de ejemplo.
