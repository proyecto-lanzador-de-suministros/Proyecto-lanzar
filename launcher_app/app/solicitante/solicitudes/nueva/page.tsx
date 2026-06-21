"use client";

import React, { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { CatalogoProducto } from "@/src/modules/stock/domain/ports/forManagingProductos.port";
import { crearSolicitudAction, obtenerProductosAction } from "@/src/actions/solicitudes.actions";
import Button from "@/app/components/ui/Button";
import { useSearchParams } from "next/navigation";

type ProductoSeleccionado = {
  productoId: string;
  cantidad: number;
};

function NuevaSolicitudForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Productos del catálogo
  const [productos, setProductos] = useState<CatalogoProducto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  // Form state
  const searchParams = useSearchParams();
  const [lat, setLat] = useState(searchParams.get("lat") ?? "");
  const [lon, setLon] = useState(searchParams.get("lon") ?? "");
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>(PrioridadSolicitud.Media);
  const [seleccionados, setSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    obtenerProductosAction().then((res) => {
      if (res.success && res.data) setProductos(res.data);
    }).finally(() => setLoadingProductos(false));
  }, []);

  function toggleProducto(id: string) {
    setSeleccionados((prev) =>
      prev.find((p) => p.productoId === id)
        ? prev.filter((p) => p.productoId !== id)
        : [...prev, { productoId: id, cantidad: 1 }]
    );
  }

  function setCantidad(id: string, cantidad: number) {
    setSeleccionados((prev) =>
      prev.map((p) => (p.productoId === id ? { ...p, cantidad } : p))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setError("Ingresá coordenadas válidas.");
      return;
    }
    if (seleccionados.length === 0) {
      setError("Seleccioná al menos un producto.");
      return;
    }

    startTransition(async () => {
      const res = await crearSolicitudAction({
        ubicacion_destino: {
          type: "Point",
          coordinates: [lonNum, latNum], // GeoJSON: [lng, lat]
        },
        prioridad,
        productos: seleccionados,
      });

      if (res.success) {
        router.push("/solicitante/missolicitudes");
      } else {
        setError(res.error ?? "Error al crear la solicitud.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 font-sans max-w-2xl">

      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Nueva solicitud</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Completá los datos del destino y los suministros que necesitás.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Coordenadas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Coordenadas de destino
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Latitud</label>
              <input
                type="number"
                step="any"
                placeholder="-38.7183"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[var(--color-brand)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Longitud</label>
              <input
                type="number"
                step="any"
                placeholder="-62.2663"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                required
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[var(--color-brand)]"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Ingresá las coordenadas del punto de recepción en formato decimal. Ej: -38.7183 / -62.2663
          </p>
        </div>

        {/* Prioridad */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prioridad</h2>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(PrioridadSolicitud).map((p) => {
              const isActive = prioridad === p;
              const colorMap: Record<PrioridadSolicitud, string> = {
                [PrioridadSolicitud.Urgente]: isActive ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" : "",
                [PrioridadSolicitud.Alta]: isActive ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" : "",
                [PrioridadSolicitud.Media]: isActive ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" : "",
                [PrioridadSolicitud.Baja]: isActive ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "",
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? colorMap[p]
                      : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:bg-slate-800"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Suministros</h2>
          {loadingProductos ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {productos.map((prod) => {
                const sel = seleccionados.find((s) => s.productoId === prod.id_producto);
                return (
                  <div
                    key={prod.id_producto}
                    onClick={() => toggleProducto(prod.id_producto)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                      sel
                        ? "border-[var(--color-brand)] bg-orange-50 dark:bg-orange-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!sel}
                        readOnly
                        className="h-4 w-4 rounded accent-[var(--color-brand)]"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{prod.nombre}</p>
                        <p className="text-xs text-slate-400">{prod.peso_kg} kg/unidad</p>
                      </div>
                    </div>
                    {sel && (
                      <input
                        type="number"
                        min={1}
                        value={sel.cantidad}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          setCantidad(prod.id_producto, Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-center focus:outline-none focus:border-[var(--color-brand)]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "Enviando..." : "Crear solicitud"}
          </Button>
        </div>

      </form>
    </div>
  );
}
export default function NuevaSolicitudPage() {
  return (
    <Suspense fallback={<NuevaSolicitudSkeleton />}>
      <NuevaSolicitudForm />
    </Suspense>
  );
}

function NuevaSolicitudSkeleton() {
  return (
    <div className="flex flex-col gap-6 font-sans max-w-2xl">
      <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
    </div>
  );
}