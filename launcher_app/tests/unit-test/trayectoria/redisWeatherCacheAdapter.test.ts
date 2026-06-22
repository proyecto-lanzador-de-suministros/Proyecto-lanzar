import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedisWeatherCacheAdapter } from "@/src/modules/trayectoria/infrastructure/adapters/redisWeatherCacheAdapter";
import type { CondicionesClimaticas } from "@/src/modules/trayectoria/domain/entities/Trayectoria";

const condicionesMock: CondicionesClimaticas = {
  velocidad_viento_ms: 10,
  direccion_viento_grados: 180,
  presion_atmosferica_hPa: 1013,
  altitud_terreno_m: 100,
  temperatura_c: 20,
};

vi.mock("@/src/infrastructure/cache/redis.client", () => ({
  getRedisClient: vi.fn(),
}));

import { getRedisClient } from "@/src/infrastructure/cache/redis.client";

describe("RedisWeatherCacheAdapter", () => {
  let adapter: RedisWeatherCacheAdapter;
  let redisMock: {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new RedisWeatherCacheAdapter();
    redisMock = { get: vi.fn(), setex: vi.fn() };
  });

  describe("obtener", () => {
    it("retorna null cuando no hay cliente Redis", async () => {
      vi.mocked(getRedisClient).mockReturnValue(null);

      const result = await adapter.obtener(-38.7, -62.3);

      expect(result).toBeNull();
    });

    it("retorna datos parseados cuando el cache tiene la clave", async () => {
      vi.mocked(getRedisClient).mockReturnValue(redisMock as any);
      redisMock.get.mockResolvedValue(JSON.stringify(condicionesMock));

      const result = await adapter.obtener(-38.7, -62.3);

      expect(result).toEqual(condicionesMock);
      expect(redisMock.get).toHaveBeenCalledWith("weather:-38.7000:-62.3000");
    });

    it("retorna null cuando la clave no existe en Redis", async () => {
      vi.mocked(getRedisClient).mockReturnValue(redisMock as any);
      redisMock.get.mockResolvedValue(null);

      const result = await adapter.obtener(-38.7, -62.3);

      expect(result).toBeNull();
    });

    it("retorna null cuando Redis lanza error", async () => {
      vi.mocked(getRedisClient).mockReturnValue(redisMock as any);
      redisMock.get.mockRejectedValue(new Error("Connection refused"));

      const result = await adapter.obtener(-38.7, -62.3);

      expect(result).toBeNull();
    });
  });

  describe("guardar", () => {
    it("no hace nada cuando no hay cliente Redis", async () => {
      vi.mocked(getRedisClient).mockReturnValue(null);

      await adapter.guardar(-38.7, -62.3, condicionesMock, 420);

      expect(redisMock.get).not.toHaveBeenCalled();
    });

    it("guarda con setex usando el TTL provisto", async () => {
      vi.mocked(getRedisClient).mockReturnValue(redisMock as any);

      await adapter.guardar(-38.7, -62.3, condicionesMock, 420);

      expect(redisMock.setex).toHaveBeenCalledWith(
        "weather:-38.7000:-62.3000",
        420,
        JSON.stringify(condicionesMock),
      );
    });

    it("usa TTL por defecto (420s) cuando no se pasa ttl", async () => {
      vi.mocked(getRedisClient).mockReturnValue(redisMock as any);

      await adapter.guardar(-38.7, -62.3, condicionesMock);

      expect(redisMock.setex).toHaveBeenCalledWith(
        "weather:-38.7000:-62.3000",
        420,
        JSON.stringify(condicionesMock),
      );
    });

    it("no lanza error si Redis falla al guardar", async () => {
      vi.mocked(getRedisClient).mockReturnValue(redisMock as any);
      redisMock.setex.mockRejectedValue(new Error("OOM"));

      await expect(
        adapter.guardar(-38.7, -62.3, condicionesMock, 420),
      ).resolves.toBeUndefined();
    });
  });
});
