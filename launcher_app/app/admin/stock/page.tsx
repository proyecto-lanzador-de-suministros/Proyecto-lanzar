"use client";

import React, { useEffect, useState } from "react";
import {
  consultarStockBaseAction,
  actualizarStockAction,
  listarBasesParaStockAction,
  listarCatalogoProductosAction,
  listarHistorialStockAction,
} from "@/src/actions/stock.actions";

interface StockItemJSON {
  productoId: string;
  nombreProducto: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
}

interface BaseOption {
  id: string;
  nombre: string;
}

interface ProductoOption {
  id_producto: string;
  nombre: string;
}

interface HistorialStockItemJSON {
  id: string;
  nombreProducto: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  actorNombre: string;
  fechaHora: string;
}

export default function AdminStockPage() {
  const [bases, setBases] = useState<BaseOption[]>([]);
  const [baseSeleccionada, setBaseSeleccionada] = useState("");
  const [stock, setStock] = useState<StockItemJSON[]>([]);
  const [catalogo, setCatalogo] = useState<ProductoOption[]>([]);

  const [loadingBases, setLoadingBases] = useState(true);
  const [loadingStock, setLoadingStock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edición inline: productoId -> valor del input
  const [edicionAbsoluta, setEdicionAbsoluta] = useState<Record<string, string>>({});
  const [edicionDelta, setEdicionDelta] = useState<Record<string, string>>({});
  const [guardandoProductoId, setGuardandoProductoId] = useState<string | null>(null);
  const [errorPorProducto, setErrorPorProducto] = useState<Record<string, string>>({});

  // Agregar producto nuevo al stock de la base
  const [productoAAgregar, setProductoAAgregar] = useState("");
  const [cantidadAAgregar, setCantidadAAgregar] = useState("");

  // Historial de stock (CU-18, postcondición): modal por producto
  const [productoHistorial, setProductoHistorial] = useState<StockItemJSON | null>(null);
  const [historialItems, setHistorialItems] = useState<HistorialStockItemJSON[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  useEffect(() => {
    listarBasesParaStockAction().then((res) => {
      if (res.success && res.data) setBases(res.data);
      else setError(res.error ?? "No se pudieron cargar las bases.");
      setLoadingBases(false);
    });
    listarCatalogoProductosAction().then((res) => {
      if (res.success && res.data) setCatalogo(res.data);
    });
  }, []);

  const cargarStock = async (id_base: string) => {
    setLoadingStock(true);
    setError(null);
    const res = await consultarStockBaseAction(id_base);
    if (res.success && res.data) {
      setStock(res.data);
      // Reset de ediciones pendientes al cambiar de base
      setEdicionAbsoluta({});
      setEdicionDelta({});
      setErrorPorProducto({});
    } else {
      setError(res.error ?? "No se pudo cargar el stock.");
      setStock([]);
    }
    setLoadingStock(false);
  };

  const handleSeleccionarBase = (id_base: string) => {
    setBaseSeleccionada(id_base);
    if (id_base) cargarStock(id_base);
    else setStock([]);
  };

  const handleGuardarAbsoluto = async (productoId: string) => {
    const valorStr = edicionAbsoluta[productoId];
    const valor = Number(valorStr);

    if (valorStr === undefined || valorStr.trim() === "" || !Number.isFinite(valor) || valor < 0) {
      setErrorPorProducto((prev) => ({ ...prev, [productoId]: "Ingresá un número positivo." }));
      return;
    }

    setGuardandoProductoId(productoId);
    setErrorPorProducto((prev) => {
      const copia = { ...prev };
      delete copia[productoId];
      return copia;
    });

    const res = await actualizarStockAction(baseSeleccionada, productoId, "absoluto", valor);

    if (res.success) {
      await cargarStock(baseSeleccionada);
    } else {
      setErrorPorProducto((prev) => ({ ...prev, [productoId]: res.error ?? "Error al actualizar." }));
    }
    setGuardandoProductoId(null);
  };

  const handleAplicarDelta = async (productoId: string, signo: 1 | -1) => {
    const valorStr = edicionDelta[productoId];
    const valorBase = Number(valorStr);

    if (valorStr === undefined || valorStr.trim() === "" || !Number.isFinite(valorBase) || valorBase <= 0) {
      setErrorPorProducto((prev) => ({ ...prev, [productoId]: "Ingresá un número positivo para sumar o restar." }));
      return;
    }

    setGuardandoProductoId(productoId);
    setErrorPorProducto((prev) => {
      const copia = { ...prev };
      delete copia[productoId];
      return copia;
    });

    const res = await actualizarStockAction(baseSeleccionada, productoId, "delta", valorBase * signo);

    if (res.success) {
      await cargarStock(baseSeleccionada);
      setEdicionDelta((prev) => ({ ...prev, [productoId]: "" }));
    } else {
      setErrorPorProducto((prev) => ({ ...prev, [productoId]: res.error ?? "Error al actualizar." }));
    }
    setGuardandoProductoId(null);
  };

  const handleAgregarProducto = async () => {
    if (!productoAAgregar) return;
    const valor = Number(cantidadAAgregar);

    if (!Number.isFinite(valor) || valor < 0) {
      setError("Ingresá una cantidad inicial positiva para el nuevo producto.");
      return;
    }

    setGuardandoProductoId(productoAAgregar);
    const res = await actualizarStockAction(baseSeleccionada, productoAAgregar, "absoluto", valor);

    if (res.success) {
      await cargarStock(baseSeleccionada);
      setProductoAAgregar("");
      setCantidadAAgregar("");
    } else {
      setError(res.error ?? "No se pudo agregar el producto.");
    }
    setGuardandoProductoId(null);
  };

  // ── Historial de stock (CU-18) ──────────────────────────────────────────
  const abrirHistorial = async (item: StockItemJSON) => {
    setProductoHistorial(item);
    setHistorialItems([]);
    setErrorHistorial(null);
    setLoadingHistorial(true);

    const res = await listarHistorialStockAction(baseSeleccionada);

    if (res.success && res.data) {
      // El use case filtra por base; acá recortamos al producto puntual
      // para mostrar solo lo relevante en el modal.
      setHistorialItems(res.data.filter((h) => h.nombreProducto === item.nombreProducto));
    } else {
      setErrorHistorial(res.error ?? "No se pudo cargar el historial.");
    }
    setLoadingHistorial(false);
  };

  const cerrarHistorial = () => {
    setProductoHistorial(null);
    setHistorialItems([]);
    setErrorHistorial(null);
  };

  // Productos del catálogo que la base todavía NO tiene cargados en stock
  const productosDisponiblesParaAgregar = catalogo.filter(
    (p) => !stock.some((s) => s.productoId === p.id_producto),
  );

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Gestión de stock</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Consultá y actualizá el inventario de cualquier base remitente.
        </p>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Selector de base */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
            Seleccioná una base remitente
          </label>
          {loadingBases ? (
            <div className="animate-pulse h-10 bg-gray-100 rounded-lg w-full max-w-sm" />
          ) : (
            <select
              className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1565C0] bg-white"
              value={baseSeleccionada}
              onChange={(e) => handleSeleccionarBase(e.target.value)}
            >
              <option value="">Seleccionar base...</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          )}
          {bases.length === 0 && !loadingBases && (
            <p className="text-xs text-[#6B7280] mt-2">No hay bases remitentes registradas todavía.</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Tabla de stock */}
        {baseSeleccionada && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1A1A2E]">Inventario</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Editá el valor absoluto o sumá/restá unidades. Los cambios se guardan al instante.
              </p>
            </div>

            {loadingStock ? (
              <div className="p-10 flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
                <span className="text-sm text-[#6B7280]">Cargando stock...</span>
              </div>
            ) : stock.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-[#1A1A2E]">
                  Esta base no tiene stock registrado todavía.
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Agregá un producto desde el formulario de abajo para comenzar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-3 font-semibold">Producto</th>
                      <th className="px-6 py-3 font-semibold">Disponible</th>
                      <th className="px-6 py-3 font-semibold">Fijar valor</th>
                      <th className="px-6 py-3 font-semibold">Sumar / Restar</th>
                      <th className="px-6 py-3 font-semibold text-center">Historial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {stock.map((item) => {
                      const enCurso = guardandoProductoId === item.productoId;
                      const errorItem = errorPorProducto[item.productoId];
                      return (
                        <tr key={item.productoId} className="hover:bg-[#F8FAFC] transition-colors align-top">
                          <td className="px-6 py-4 font-medium text-[#1A1A2E]">
                            {item.nombreProducto}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-[#1A1A2E]">
                              {item.cantidad_disponible}
                            </span>
                            <span className="text-xs text-[#6B7280] ml-1">unidades</span>
                          </td>
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
                                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#1565C0]"
                              />
                              <button
                                onClick={() => handleGuardarAbsoluto(item.productoId)}
                                disabled={enCurso}
                                className="text-[#1565C0] bg-blue-50 hover:bg-[#1565C0] hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              >
                                {enCurso ? "..." : "Fijar"}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                placeholder="cantidad"
                                value={edicionDelta[item.productoId] ?? ""}
                                onChange={(e) =>
                                  setEdicionDelta((prev) => ({ ...prev, [item.productoId]: e.target.value }))
                                }
                                className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#1565C0]"
                              />
                              <button
                                onClick={() => handleAplicarDelta(item.productoId, 1)}
                                disabled={enCurso}
                                title="Sumar al stock"
                                className="text-[#4CAF50] bg-green-50 hover:bg-[#4CAF50] hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleAplicarDelta(item.productoId, -1)}
                                disabled={enCurso}
                                title="Restar del stock"
                                className="text-[#F44336] bg-red-50 hover:bg-[#F44336] hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                              >
                                −
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => abrirHistorial(item)}
                              className="text-[#6B7280] bg-gray-50 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            >
                              Ver historial
                            </button>
                          </td>
                          {errorItem && (
                            <td colSpan={5} className="px-6 pb-3 -mt-2">
                              <p className="text-[11px] text-red-600">{errorItem}</p>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Agregar producto nuevo al stock de la base */}
        {baseSeleccionada && productosDisponiblesParaAgregar.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#1A1A2E] mb-3">
              Agregar producto al inventario de esta base
            </h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-[#6B7280] mb-1.5">Producto</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white"
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
                <label className="block text-xs text-[#6B7280] mb-1.5">Cantidad inicial</label>
                <input
                  type="number"
                  min={0}
                  value={cantidadAAgregar}
                  onChange={(e) => setCantidadAAgregar(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
              <button
                onClick={handleAgregarProducto}
                disabled={!productoAAgregar || guardandoProductoId === productoAAgregar}
                className="bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: historial de cambios de stock por producto (CU-18, postcondición) */}
      {productoHistorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarHistorial();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A2E]">Historial de stock</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{productoHistorial.nombreProducto}</p>
              </div>
              <button
                onClick={cerrarHistorial}
                className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {loadingHistorial ? (
              <div className="py-10 flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F5A623]" />
                <span className="text-sm text-[#6B7280]">Cargando historial...</span>
              </div>
            ) : errorHistorial ? (
              <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2">{errorHistorial}</p>
            ) : historialItems.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-6 text-center">
                Todavía no hay cambios registrados para este producto en esta base.
              </p>
            ) : (
              <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-5">
                {historialItems.map((h) => {
                  const subio = h.cantidadNueva >= h.cantidadAnterior;
                  return (
                    <div key={h.id} className="relative">
                      <span
                        className={`absolute -left-[31px] top-1 bg-white border-2 w-3.5 h-3.5 rounded-full ${
                          subio ? "border-[#4CAF50]" : "border-[#F44336]"
                        }`}
                      />
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="font-semibold text-[#1A1A2E]">{h.cantidadAnterior}</span>
                        <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className={`font-semibold ${subio ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                          {h.cantidadNueva}
                        </span>
                        <span className="text-xs text-[#6B7280] ml-1">unidades</span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {new Date(h.fechaHora).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · por {h.actorNombre}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={cerrarHistorial}
              className="w-full mt-6 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}