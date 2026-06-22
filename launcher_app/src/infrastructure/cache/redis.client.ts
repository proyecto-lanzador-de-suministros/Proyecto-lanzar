import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[Redis] REDIS_URL no configurada — operando sin caché.");
    redisClient = null;
    return null;
  }

  try {
    redisClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on("error", (err) => {
      console.warn("[Redis] Error de conexión:", err.message);
    });
  } catch (err) {
    console.warn("[Redis] No se pudo inicializar el cliente:", (err as Error).message);
    redisClient = null;
  }

  return redisClient;
}
