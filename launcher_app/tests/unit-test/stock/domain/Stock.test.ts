import { describe, it, expect } from "vitest";
import { Stock } from "@/src/modules/stock/domain/entities/Stock";

describe("Stock", () => {
  describe("crear", () => {
    it("crea stock con cantidad reservada en 0", () => {
      const stock = Stock.crear({
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 100,
      });

      expect(stock.id).toBeDefined();
      expect(stock.disponible).toBe(100);
      expect(stock.reservado).toBe(0);
    });
  });

  describe("reconstruir", () => {
    it("reconstruye stock desde datos existentes", () => {
      const stock = Stock.reconstruir({
        id: "stk-001",
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 80,
        cantidadReservada: 20,
      });

      expect(stock.id).toBe("stk-001");
      expect(stock.disponible).toBe(80);
      expect(stock.reservado).toBe(20);
    });
  });

  describe("reservar", () => {
    it("reserva cantidad válida", () => {
      const stock = Stock.crear({
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 100,
      });

      stock.reservar(30);

      expect(stock.disponible).toBe(70);
      expect(stock.reservado).toBe(30);
    });

    it("lanza error si cantidad es 0 o negativa", () => {
      const stock = Stock.crear({
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 100,
      });

      expect(() => stock.reservar(0)).toThrow("Cantidad inválida");
      expect(() => stock.reservar(-5)).toThrow("Cantidad inválida");
    });

    it("lanza error si stock insuficiente", () => {
      const stock = Stock.crear({
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 10,
      });

      expect(() => stock.reservar(20)).toThrow("STOCK_INSUFICIENTE");
    });
  });

  describe("liberar", () => {
    it("libera cantidad reservada", () => {
      const stock = Stock.reconstruir({
        id: "stk-001",
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 70,
        cantidadReservada: 30,
      });

      stock.liberar(20);

      expect(stock.disponible).toBe(90);
      expect(stock.reservado).toBe(10);
    });

    it("lanza error si cantidad es 0 o negativa", () => {
      const stock = Stock.reconstruir({
        id: "stk-001",
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 70,
        cantidadReservada: 30,
      });

      expect(() => stock.liberar(0)).toThrow("Cantidad inválida");
    });
  });

  describe("reponer", () => {
    it("reponer cantidad al stock disponible", () => {
      const stock = Stock.crear({
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 50,
      });

      stock.reponer(25);

      expect(stock.disponible).toBe(75);
      expect(stock.reservado).toBe(0);
    });

    it("lanza error si cantidad es 0 o negativa", () => {
      const stock = Stock.crear({
        baseId: "rem-001",
        productoId: "prod-001",
        cantidadDisponible: 50,
      });

      expect(() => stock.reponer(-10)).toThrow("Cantidad inválida");
    });
  });
});
