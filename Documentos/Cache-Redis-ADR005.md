# Caché con Redis — ADR-005

## ¿Para qué sirve?

Redis almacena temporalmente las respuestas climáticas de Open-Meteo API con un TTL de 7 minutos (Cache-Aside Pattern). Esto evita consultar la API externa en cada solicitud de trayectoria, reduce la latencia y provee resiliencia si la API de clima falla (Cache hit con datos previos).

## ¿Es obligatorio?

**No.** Si `REDIS_URL` no está configurado o Redis está caído, el sistema opera normalmente consultando la API de clima directamente (sin caché). Se registra un warning en los logs del servidor.

Esto sigue el patrón **Cache-Aside** que define ADR-005: si no hay caché, se consulta el origen.

## Configuración

### 1. Variable de entorno

En `launcher_app/.env.local`:

```env
REDIS_URL=redis://localhost:6379
```

Si la línea está vacía o ausente, el sistema ignora el caché.

### 2. Levantar Redis localmente (Docker)

```bash
docker run -d --name redis-cache -p 6379:6379 redis:7
```

Verificar que funciona:

```bash
docker logs redis-cache
```

### 3. Detener Redis

```bash
docker stop redis-cache
docker rm redis-cache
```

### 4. Sin Docker

Se puede instalar Redis directamente desde [redis.io/download](https://redis.io/download/) o desde un gestor de paquetes (ej. `apt install redis-server` en Linux, `brew install redis` en macOS, o Redis para Windows desde WSL).
