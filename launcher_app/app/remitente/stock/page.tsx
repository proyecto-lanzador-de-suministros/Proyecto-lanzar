"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState, useCallback } from "react";
import {
  consultarStockBaseAction,
  actualizarStockAction,
  listarCatalogoProductosAction,
} from "@/src/actions/stock.actions";
import { obtenerMiBaseAction } from "@/src/actions/remitente-acciones.actions";

interface StockItemData {
  productoId: string;
  nombreProducto?: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
}

interface CatalogoItem {
  id_producto: string;
  nombre: string;
}

export default function RemitenteStockPage() {
  const [idBase, setIdBase] = useState<string | null>(null);
  const [stock, setStock] = useState<StockItemData[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [edicionAbsoluta, setEdicionAbsoluta] = useState<Record<string, string>>({});
  const [edicionDelta, setEdicionDelta] = useState<Record<string, string>>({});

  const [productoAAgregar, setProductoAAgregar] = useState("");
  const [cantidadAAgregar, setCantidadAAgregar] = useState("");

  // Obtener id_base del remitente logueado
  useEffect(() => {
    (async () => {
      const res = await obtenerMiBaseAction();
      if (res.success && res.data?.id_base) {
        setIdBase(res.data.id_base);
      }
    })();
  }, []);

  const cargarStock = useCallback(async () => {
    if (!idBase) return;
    try {
      const [stockRes, catalogoRes] = await Promise.all([
        consultarStockBaseAction(idBase),
        listarCatalogoProductosAction(),
      ]);
      if (stockRes.success && stockRes.data) {
        setStock(stockRes.data);
      } else {
        setError(stockRes.error || "Error al cargar stock.");
      }
      if (catalogoRes.success && catalogoRes.data) {
        setCatalogo(catalogoRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [idBase]);

  useEffect(() => {
    if (idBase) cargarStock();
  }, [idBase, cargarStock]);

  const mostrarMensaje = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 2500);
  };

  const handleFijar = async (productoId: string) => {
    if (!idBase) return;
    const valorStr = edicionAbsoluta[productoId];
    if (!valorStr) return;
    const valor = parseInt(valorStr, 10);
    if (isNaN(valor) || valor < 0) {
      setError("Ingresá un número válido mayor o igual a 0.");
      return;
    }
    setError(null);
    const res = await actualizarStockAction(idBase, productoId, "absoluto", valor);
    if (res.success) {
      mostrarMensaje("Stock actualizado correctamente.");
      setEdicionAbsoluta((prev) => ({ ...prev, [productoId]: "" }));
      await cargarStock();
    } else {
      setError(res.error || "Error al actualizar stock.");
    }
  };

  const handleDelta = async (productoId: string, signo: 1 | -1) => {
    if (!idBase) return;
    const valorStr = edicionDelta[productoId];
    const valor = parseInt(valorStr || "1", 10);
    if (isNaN(valor) || valor <= 0) {
      setError("Ingresá una cantidad válida.");
      return;
    }
    setError(null);
    const res = await actualizarStockAction(idBase, productoId, "delta", valor * signo);
    if (res.success) {
      mostrarMensaje("Stock ajustado correctamente.");
      setEdicionDelta((prev) => ({ ...prev, [productoId]: "" }));
      await cargarStock();
    } else {
      setError(res.error || "Error al ajustar stock.");
    }
  };

  const handleAgregarProducto = async () => {
    if (!idBase || !productoAAgregar) return;
    const cantidad = parseInt(cantidadAAgregar || "0", 10);
    setError(null);
    const res = await actualizarStockAction(idBase, productoAAgregar, "absoluto", cantidad);
    if (res.success) {
      const nombre = catalogo.find((p) => p.id_producto === productoAAgregar)?.nombre || "";
      mostrarMensaje(`"${nombre}" agregado al stock.`);
      setProductoAAgregar("");
      setCantidadAAgregar("");
      await cargarStock();
    } else {
      setError(res.error || "Error al agregar producto.");
    }
  };

  const productosEnStock = new Set(stock.map((s) => s.productoId));
  const productosDisponiblesParaAgregar = catalogo.filter(
    (p) => !productosEnStock.has(p.id_producto),
  );

  return (
    <div className="flex flex-col gap-6 font-sans">

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi stock</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Consultá y actualizá el inventario de tu base de lanzamiento.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs">
          {error}
        </div>
      )}

      {mensajeExito && (
        <div className="bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
          {mensajeExito}
        </div>
      )}

      {!idBase ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="text-sm text-slate-500">No se pudo identificar tu base de lanzamiento.</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Inventario actual</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Editá el valor absoluto o sumá/restá unidades.
              </p>
            </div>

            {loading ? (
              <div className="p-10 flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
                <span className="text-sm text-slate-400">Cargando stock...</span>
              </div>
            ) : stock.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tu base no tiene stock registrado.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Agregá un producto desde el formulario de abajo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-3 font-semibold">Producto</th>
                      <th className="px-6 py-3 font-semibold">Disponible</th>
                      <th className="px-6 py-3 font-semibold">Reservado</th>
                      <th className="px-6 py-3 font-semibold">Fijar valor</th>
                      <th className="px-6 py-3 font-semibold">Sumar / Restar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
                    {stock.map((item) => (
                      <tr key={item.productoId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                          {item.nombreProducto || item.productoId}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {item.cantidad_disponible}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">unid.</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.cantidad_reservada}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              placeholder={String(item.cantidad_disponible)}
                              value={edicionAbsoluta[item.productoId] ?? ""}
                              onChange={(e) =>
                                setEdicionAbsoluta((prev) => ({ ...prev, [item.productoId]: e.target.value }))
                              }
                              className="w-24 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900"
                            />
                            <button
                              onClick={() => handleFijar(item.productoId)}
                              className="text-brand bg-orange-50 dark:bg-orange-950/25 hover:bg-brand hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            >
                              Fijar
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              placeholder="cant."
                              value={edicionDelta[item.productoId] ?? ""}
                              onChange={(e) =>
                                setEdicionDelta((prev) => ({ ...prev, [item.productoId]: e.target.value }))
                              }
                              className="w-20 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900"
                            />
                            <button
                              onClick={() => handleDelta(item.productoId, 1)}
                              title="Sumar"
                              className="text-green-600 bg-green-50 dark:bg-green-950/25 hover:bg-green-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleDelta(item.productoId, -1)}
                              title="Restar"
                              className="text-red-500 bg-red-50 dark:bg-red-950/25 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              −
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {productosDisponiblesParaAgregar.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Agregar producto al inventario
              </h2>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-slate-400 mb-1.5">Producto</label>
                  <select
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900"
                    value={productoAAgregar}
                    onChange={(e) => setProductoAAgregar(e.target.value)}
                  >
                    <option value="">Seleccionar producto...</option>
                    {productosDisponiblesParaAgregar.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs text-slate-400 mb-1.5">Cantidad inicial</label>
                  <input
                    type="number"
                    min={0}
                    value={cantidadAAgregar}
                    onChange={(e) => setCantidadAAgregar(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900"
                  />
                </div>
                <button
                  onClick={handleAgregarProducto}
                  disabled={!productoAAgregar}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
