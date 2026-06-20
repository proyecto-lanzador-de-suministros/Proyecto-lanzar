import { describe, it, expect } from "vitest";
import { PrismaStockRepository } from "@/src/modules/stock/infrastructure/adapters/PrismaStockRepository";
import { prisma } from "@/src/infrastructure/db/prisma.client";
import {
  crearRemitenteFixture,
  crearProductoFixture,
} from "../fixtures/shared.fixtures";

const repo = new PrismaStockRepository();

describe("PrismaStockRepository (integration)", () => {
  describe("consultarPorBase (CU-17)", () => {
    it("retorna los items de stock con nombre de producto", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma, {
        nombreBase: "Base Test",
      });
      const { idProducto } = await crearProductoFixture(prisma, {
        nombre: "Harina",
      });

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: idProducto,
          cantidad_disponible: 10,
        },
      });

      const resultado = await repo.consultarPorBase(idRemitente);

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toEqual({
        productoId: idProducto,
        nombreProducto: "Harina",
        cantidad_disponible: 10,
        cantidad_reservada: 0,
      });
    });

    it("retorna array vacío si la base no tiene stock", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);

      const resultado = await repo.consultarPorBase(idRemitente);

      expect(resultado).toEqual([]);
    });
  });

  describe("actualizarCantidad (CU-18)", () => {
    it("crea un registro de stock cuando no existe", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);
      const { idProducto } = await crearProductoFixture(prisma);

      await repo.actualizarCantidad(idRemitente, idProducto, 15);

      const stock = await prisma.stock_Base.findFirst({
        where: { id_remitente: idRemitente, id_producto: idProducto },
      });
      expect(stock).not.toBeNull();
      expect(stock!.cantidad_disponible).toBe(15);
    });

    it("actualiza un registro de stock existente", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);
      const { idProducto } = await crearProductoFixture(prisma);

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: idProducto,
          cantidad_disponible: 10,
        },
      });

      await repo.actualizarCantidad(idRemitente, idProducto, 25);

      const stock = await prisma.stock_Base.findFirst({
        where: { id_remitente: idRemitente, id_producto: idProducto },
      });
      expect(stock!.cantidad_disponible).toBe(25);
    });
  });

  describe("verificarYReservar (CU-09)", () => {
    it("retorna disponible=true y descuenta stock cuando hay suficiente", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma, {
        latitud: -34.6,
        longitud: -58.38,
      });
      const { idProducto } = await crearProductoFixture(prisma);

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: idProducto,
          cantidad_disponible: 10,
        },
      });

      const resultado = await repo.verificarYReservar({
        ubicacion_destino: { type: "Point", coordinates: [-58.4, -34.6] },
        productos: [{ productoId: idProducto, cantidad: 3 }],
      });

      expect(resultado.disponible).toBe(true);
      expect(resultado.id_base).toBe(idRemitente);

      const stock = await prisma.stock_Base.findFirst({
        where: { id_remitente: idRemitente, id_producto: idProducto },
      });
      expect(stock!.cantidad_disponible).toBe(7);
    });

    it("retorna disponible=false cuando no hay stock suficiente", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);
      const { idProducto } = await crearProductoFixture(prisma);

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: idProducto,
          cantidad_disponible: 2,
        },
      });

      const resultado = await repo.verificarYReservar({
        ubicacion_destino: { type: "Point", coordinates: [-62.3, -38.7] },
        productos: [{ productoId: idProducto, cantidad: 5 }],
      });

      expect(resultado.disponible).toBe(false);
      expect(resultado.productosFaltantes).toContain(idProducto);
    });

    it("retorna disponible=false si falta al menos un producto", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);
      const { idProducto: p1 } = await crearProductoFixture(prisma, {
        nombre: "Producto A",
      });
      const { idProducto: p2 } = await crearProductoFixture(prisma, {
        nombre: "Producto B",
      });

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: p1,
          cantidad_disponible: 10,
        },
      });
      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: p2,
          cantidad_disponible: 0,
        },
      });

      const resultado = await repo.verificarYReservar({
        ubicacion_destino: { type: "Point", coordinates: [-62.3, -38.7] },
        productos: [
          { productoId: p1, cantidad: 3 },
          { productoId: p2, cantidad: 1 },
        ],
      });

      expect(resultado.disponible).toBe(false);
      expect(resultado.productosFaltantes).toContain(p2);
    });

    it("elige la base más cercana cuando múltiples tienen stock", async () => {
      const { idRemitente: cerca } = await crearRemitenteFixture(prisma, {
        nombreBase: "Base Cercana",
        latitud: -34.6,
        longitud: -58.38,
      });
      const { idRemitente: lejos } = await crearRemitenteFixture(prisma, {
        nombreBase: "Base Lejana",
        latitud: -38.7,
        longitud: -62.3,
      });
      const { idProducto } = await crearProductoFixture(prisma);

      await prisma.stock_Base.create({
        data: {
          id_remitente: cerca,
          id_producto: idProducto,
          cantidad_disponible: 5,
        },
      });
      await prisma.stock_Base.create({
        data: {
          id_remitente: lejos,
          id_producto: idProducto,
          cantidad_disponible: 5,
        },
      });

      const resultado = await repo.verificarYReservar({
        ubicacion_destino: { type: "Point", coordinates: [-58.4, -34.6] },
        productos: [{ productoId: idProducto, cantidad: 2 }],
      });

      expect(resultado.disponible).toBe(true);
      expect(resultado.id_base).toBe(cerca);
    });

    it("asigna base lejana si la cercana no tiene stock pero la lejana sí", async () => {
      const { idRemitente: cerca } = await crearRemitenteFixture(prisma, {
        nombreBase: "Base Cercana Sin Stock",
        latitud: -34.6,
        longitud: -58.38,
      });
      const { idRemitente: lejos } = await crearRemitenteFixture(prisma, {
        nombreBase: "Base Lejana Con Stock",
        latitud: -38.7,
        longitud: -62.3,
      });
      const { idProducto } = await crearProductoFixture(prisma);

      await prisma.stock_Base.create({
        data: {
          id_remitente: lejos,
          id_producto: idProducto,
          cantidad_disponible: 10,
        },
      });

      const resultado = await repo.verificarYReservar({
        ubicacion_destino: { type: "Point", coordinates: [-58.4, -34.6] },
        productos: [{ productoId: idProducto, cantidad: 3 }],
      });

      expect(resultado.disponible).toBe(true);
      expect(resultado.id_base).toBe(lejos);
    });
  });

  describe("liberarReserva (CU-10/11)", () => {
    it("incrementa el stock al liberar la reserva", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);
      const { idProducto } = await crearProductoFixture(prisma);

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: idProducto,
          cantidad_disponible: 5,
        },
      });

      await repo.liberarReserva({
        id_base: idRemitente,
        productos: [{ productoId: idProducto, cantidad: 3 }],
      });

      const stock = await prisma.stock_Base.findFirst({
        where: { id_remitente: idRemitente, id_producto: idProducto },
      });
      expect(stock!.cantidad_disponible).toBe(8);
    });

    it("libera múltiples productos en una sola operación", async () => {
      const { idRemitente } = await crearRemitenteFixture(prisma);
      const { idProducto: p1 } = await crearProductoFixture(prisma, {
        nombre: "Producto A",
      });
      const { idProducto: p2 } = await crearProductoFixture(prisma, {
        nombre: "Producto B",
      });

      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: p1,
          cantidad_disponible: 10,
        },
      });
      await prisma.stock_Base.create({
        data: {
          id_remitente: idRemitente,
          id_producto: p2,
          cantidad_disponible: 20,
        },
      });

      await repo.liberarReserva({
        id_base: idRemitente,
        productos: [
          { productoId: p1, cantidad: 4 },
          { productoId: p2, cantidad: 6 },
        ],
      });

      const s1 = await prisma.stock_Base.findFirst({
        where: { id_remitente: idRemitente, id_producto: p1 },
      });
      const s2 = await prisma.stock_Base.findFirst({
        where: { id_remitente: idRemitente, id_producto: p2 },
      });
      expect(s1!.cantidad_disponible).toBe(14);
      expect(s2!.cantidad_disponible).toBe(26);
    });
  });
});
