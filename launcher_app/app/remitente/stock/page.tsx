"use client";

import React, { useState } from "react";

interface StockItemMock {
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

const MOCK_BASES: BaseOption[] = [
  { id: "BASE-001", nombre: "Base El Palomar" },
  { id: "BASE-002", nombre: "Base Mar del Plata" },
  { id: "BASE-003", nombre: "Base Córdoba" },
];

const MOCK_STOCK: Record<string, StockItemMock[]> = {
  "BASE-001": [
    { productoId: "VAC-001", nombreProducto: "Vacunas y Suero Fisiológico", cantidad_disponible: 200, cantidad_reservada: 50 },
    { productoId: "BOT-001", nombreProducto: "Botiquín de Primeros Auxilios", cantidad_disponible: 15, cantidad_reservada: 2 },
    { productoId: "RAC-001", nombreProducto: "Raciones de Emergencia", cantidad_disponible: 500, cantidad_reservada: 200 },
  ],
  "BASE-002": [
    { productoId: "VAC-001", nombreProducto: "Vacunas y Suero Fisiológico", cantidad_disponible: 100, cantidad_reservada: 30 },
    { productoId: "RAC-001", nombreProducto: "Raciones de Emergencia", cantidad_disponible: 300, cantidad_reservada: 100 },
  ],
  "BASE-003": [
    { productoId: "BOT-001", nombreProducto: "Botiquín de Primeros Auxilios", cantidad_disponible: 10, cantidad_reservada: 1 },
    { productoId: "RAC-001", nombreProducto: "Raciones de Emergencia", cantidad_disponible: 400, cantidad_reservada: 150 },
    { productoId: "VAC-001", nombreProducto: "Vacunas y Suero Fisiológico", cantidad_disponible: 80, cantidad_reservada: 20 },
  ],
};

const MOCK_CATALOGO: ProductoOption[] = [
  { id_producto: "VAC-001", nombre: "Vacunas y Suero Fisiológico" },
  { id_producto: "BOT-001", nombre: "Botiquín de Primeros Auxilios" },
  { id_producto: "RAC-001", nombre: "Raciones de Emergencia" },
];

export default function RemitenteStockPage() {
  const [baseSeleccionada, setBaseSeleccionada] = useState("");
  const [stock, setStock] = useState<StockItemMock[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [edicionAbsoluta, setEdicionAbsoluta] = useState<Record<string, string>>({});
  const [edicionDelta, setEdicionDelta] = useState<Record<string, string>>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [productoAAgregar, setProductoAAgregar] = useState("");
  const [cantidadAAgregar, setCantidadAAgregar] = useState("");

  const cargarStock = (id_base: string) => {
    setLoadingStock(true);
    setMensajeExito(null);
    setTimeout(() => {
      const data = MOCK_STOCK[id_base] || [];
      setStock(data);
      setEdicionAbsoluta({});
      setEdicionDelta({});
      setLoadingStock(false);
    }, 400);
  };

  const handleSeleccionarBase = (id_base: string) => {
    setBaseSeleccionada(id_base);
    if (id_base) cargarStock(id_base);
    else setStock([]);
  };

  const handleFijar = (productoId: string) => {
    setMensajeExito(`Stock de "${stock.find((s) => s.productoId === productoId)?.nombreProducto}" actualizado.`);
    setTimeout(() => setMensajeExito(null), 2000);
  };

  const handleDelta = (productoId: string) => {
    setMensajeExito(`Stock ajustado correctamente.`);
    setTimeout(() => setMensajeExito(null), 2000);
  };

  const handleAgregarProducto = () => {
    if (!productoAAgregar) return;
    const nombre = MOCK_CATALOGO.find((p) => p.id_producto === productoAAgregar)?.nombre || "";
    setStock((prev) => [
      ...prev,
      { productoId: productoAAgregar, nombreProducto: nombre, cantidad_disponible: Number(cantidadAAgregar) || 0, cantidad_reservada: 0 },
    ]);
    setProductoAAgregar("");
    setCantidadAAgregar("");
    setMensajeExito(`"${nombre}" agregado al stock.`);
    setTimeout(() => setMensajeExito(null), 2000);
  };

  const productosDisponiblesParaAgregar = MOCK_CATALOGO.filter(
    (p) => !stock.some((s) => s.productoId === p.id_producto),
  );

  return (
    <div className="flex flex-col gap-6 font-sans">

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi stock</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Consultá y actualizá el inventario de tu base de lanzamiento.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Seleccioná tu base
        </label>
        <select
          className="w-full max-w-sm border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          value={baseSeleccionada}
          onChange={(e) => handleSeleccionarBase(e.target.value)}
        >
          <option value="">Seleccionar base...</option>
          {MOCK_BASES.map((b) => (
            <option key={b.id} value={b.id}>{b.nombre}</option>
          ))}
        </select>
      </div>

      {mensajeExito && (
        <div className="bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
          {mensajeExito}
        </div>
      )}

      {baseSeleccionada && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Inventario actual</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Editá el valor absoluto o sumá/restá unidades.
            </p>
          </div>

          {loadingStock ? (
            <div className="p-10 flex justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
              <span className="text-sm text-slate-400">Cargando stock...</span>
            </div>
          ) : stock.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Esta base no tiene stock registrado.
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
                        {item.nombreProducto}
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
                            min={0}
                            placeholder="cant."
                            value={edicionDelta[item.productoId] ?? ""}
                            onChange={(e) =>
                              setEdicionDelta((prev) => ({ ...prev, [item.productoId]: e.target.value }))
                            }
                            className="w-20 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900"
                          />
                          <button
                            onClick={() => handleDelta(item.productoId)}
                            title="Sumar"
                            className="text-green-600 bg-green-50 dark:bg-green-950/25 hover:bg-green-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleDelta(item.productoId)}
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
      )}

      {baseSeleccionada && productosDisponiblesParaAgregar.length > 0 && (
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

    </div>
  );
}
