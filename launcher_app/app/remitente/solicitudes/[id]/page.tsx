"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { consultarDetalleSolicitudRemitenteAction } from "@/src/actions/remitente-acciones.actions";
import {
  registrarEnPreparacionAction,
  registrarListaAction,
  registrarEnCaminoAction,
  registrarLanzadaAction,
  anularSolicitudAction,
} from "@/src/actions/solicitudes.actions";
import { consultarStockBaseAction } from "@/src/actions/stock.actions";

const STATUS_FLOW = ["Asignada", "En preparación", "Lista", "En camino", "Lanzada"];

const STATUS_VARIANT: Record<string, "info" | "success" | "danger" | "warning"> = {
  "En preparación": "warning",
  "Lista": "warning",
  "En camino": "info",
  "Lanzada": "info",
  "Completada": "success",
  "Entregada": "success",
  "Cancelada": "danger",
  "Anulada": "danger",
  "Rechazada": "danger",
  "Asignada": "warning",
  "Creada": "warning",
};

const getStatusVariant = (estado: string): "info" | "success" | "danger" | "warning" => {
  return STATUS_VARIANT[estado] || "warning";
};

const FLOW_ACTION_MAP: Record<string, (id: string) => Promise<any>> = {
  "En preparación": (id: string) => registrarEnPreparacionAction(id),
  "Lista": (id: string) => registrarListaAction(id, 1),
  "En camino": (id: string) => registrarEnCaminoAction(id),
  "Lanzada": (id: string) => registrarLanzadaAction(id),
};

interface ProductoConNombre {
  productoId: string;
  nombre: string;
  cantidad: number;
}

interface StockItem {
  cantidad_disponible: number;
  nombreProducto?: string;
}

export default function RemitenteSolicitudDetallePage() {
  const params = useParams();
  const router = useRouter();
  const solicitudId = params.id as string;

  const [solicitud, setSolicitud] = useState<any>(null);
  const [stockBase, setStockBase] = useState<Record<string, StockItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionEjecutando, setAccionEjecutando] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mostrarModalAnular, setMostrarModalAnular] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!solicitudId) return;
    (async () => {
      try {
        const res = await consultarDetalleSolicitudRemitenteAction(solicitudId);
        if (!mountedRef.current) return;
        if (res.success && res.data) {
          setSolicitud(res.data);
          if (res.data.baseId) {
            const stockRes = await consultarStockBaseAction(res.data.baseId);
            if (!mountedRef.current) return;
            if (stockRes.success && stockRes.data) {
              const stockMap: Record<string, StockItem> = {};
              stockRes.data.forEach((item: any) => {
                stockMap[item.productoId] = item;
              });
              setStockBase(stockMap);
            }
          }
        } else {
          setError(res.error || "Error al cargar la solicitud.");
        }
      } catch (err: any) {
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
    return () => { mountedRef.current = false; };
  }, [solicitudId]);

  const refetch = () => {
    mountedRef.current = true;
    if (!solicitudId) return;
    setError(null);
    (async () => {
      try {
        setLoading(true);
        const res = await consultarDetalleSolicitudRemitenteAction(solicitudId);
        if (!mountedRef.current) return;
        if (res.success && res.data) {
          setSolicitud(res.data);
          if (res.data.baseId) {
            const stockRes = await consultarStockBaseAction(res.data.baseId);
            if (!mountedRef.current) return;
            if (stockRes.success && stockRes.data) {
              const stockMap: Record<string, StockItem> = {};
              stockRes.data.forEach((item: any) => {
                stockMap[item.productoId] = item;
              });
              setStockBase(stockMap);
            }
          }
        } else {
          setError(res.error || "Error al cargar la solicitud.");
        }
      } catch (err: any) {
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
  };

  const ejecutarAccion = async (nextEstado: string) => {
    setAccionEjecutando(nextEstado);
    setError(null);
    setMensajeExito(null);
    try {
      const action = FLOW_ACTION_MAP[nextEstado];
      if (!action) return;
      const res = await action(solicitudId);
      if (res.success) {
        setMensajeExito(`Estado actualizado a "${nextEstado}"`);
        refetch();
      } else {
        setError(res.error || "Error al actualizar estado.");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
    } finally {
      setAccionEjecutando(null);
    }
  };

  const ejecutarAnulacion = async () => {
    if (!motivoAnulacion.trim()) {
      setError("Debés ingresar un motivo de anulación.");
      return;
    }
    setAccionEjecutando("anular");
    setError(null);
    setMensajeExito(null);
    try {
      const formData = new FormData();
      formData.set("motivo", motivoAnulacion);
      const res = await anularSolicitudAction(solicitudId, formData);
      if (res.success) {
        setMensajeExito("Solicitud anulada correctamente.");
        setMostrarModalAnular(false);
        refetch();
      } else {
        setError(res.error || "Error al anular solicitud.");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
    } finally {
      setAccionEjecutando(null);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) + " - " +
           d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " hs";
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 font-sans max-w-5xl">
        <div className="h-8 w-48 bg-slate-50 dark:bg-slate-800 animate-pulse rounded" />
        <div className="h-48 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
          <div className="h-48 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !solicitud) {
    return (
      <div className="flex flex-col gap-6 font-sans max-w-5xl">
        <button onClick={() => router.push("/remitente/solicitudes")}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 w-fit cursor-pointer bg-transparent border-none"
        >← Volver a solicitudes</button>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!solicitud) return null;

  const currentStepIndex = STATUS_FLOW.indexOf(solicitud.estado);
  const estadosFinales = ["Cancelada", "Anulada", "Rechazada", "Completada", "Entregada"];
  const esEstadoFinal = estadosFinales.includes(solicitud.estado);
  const puedeAnular = !esEstadoFinal && solicitud.estado !== "Creada";

  return (
    <div className="flex flex-col gap-6 font-sans max-w-5xl">

      <button
        onClick={() => router.push("/remitente/solicitudes")}
        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 w-fit cursor-pointer bg-transparent border-none"
      >
        ← Volver a solicitudes
      </button>

      {mensajeExito && (
        <div className="bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
          {mensajeExito}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">
            #{solicitud.id?.substring(0, 8).toUpperCase()}
          </h1>
          <StatusBadge variant={getStatusVariant(solicitud.estado)}>{solicitud.estado}</StatusBadge>
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
            Prioridad {solicitud.prioridad}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">SOLICITANTE</p>
              <p className="text-slate-700 dark:text-slate-300">{solicitud.solicitanteNombre}</p>
              {solicitud.solicitanteEmail && (
                <p className="text-xs text-slate-400">{solicitud.solicitanteEmail}</p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">DESTINO</p>
              <p className="text-xs text-slate-400">
                Lat: {solicitud.ubicacion_destino?.coordinates?.[1]?.toFixed(6)} | Lng: {solicitud.ubicacion_destino?.coordinates?.[0]?.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">FECHAS</p>
              <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Solicitada:</strong> {formatDate(solicitud.fechaSolicitada)}</p>
              {solicitud.fechaEntrega && (
                <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Entrega:</strong> {formatDate(solicitud.fechaEntrega)}</p>
              )}
            </div>
          </div>
        </div>

        {solicitud.motivoCancelacion && (
          <div className="mt-4 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs">
            <strong>Motivo de cancelación:</strong> {solicitud.motivoCancelacion}
          </div>
        )}

        {solicitud.motivoAnulacion && (
          <div className="mt-4 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs">
            <strong>Motivo de anulación:</strong> {solicitud.motivoAnulacion}
          </div>
        )}
      </div>

      {error && solicitud && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Productos solicitados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-400 font-semibold uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">Cantidad</th>
                    <th className="pb-2">Disponible en base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {solicitud.productos.map((p: ProductoConNombre, idx: number) => {
                    const stock = stockBase[p.productoId];
                    const disponible = stock?.cantidad_disponible ?? 0;
                    const suficiente = disponible >= p.cantidad;
                    return (
                      <tr key={idx}>
                        <td className="py-3 text-slate-700 dark:text-slate-300">{p.nombre}</td>
                        <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{p.cantidad}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold ${suficiente ? "text-green-600" : "text-red-500"}`}>
                            {stock ? `${disponible} unid.` : "—"}{" "}
                            {suficiente ? "✅" : "❌"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {solicitud.trayectoria && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
                🚀 Datos de trayectoria
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-1">PUNTO DE LANZAMIENTO (CARP)</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Lat: {solicitud.trayectoria.punto_lanzamiento.lat.toFixed(6)} | Lon: {solicitud.trayectoria.punto_lanzamiento.lon.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-1">OFFSET</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {solicitud.trayectoria.offset_norte_m > 0 ? `${solicitud.trayectoria.offset_norte_m} m al norte` : "0 m"}{" | "}
                    {solicitud.trayectoria.offset_este_m > 0 ? `${solicitud.trayectoria.offset_este_m} m al este` : "0 m"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-1">LANZAMIENTO ESTIMADO</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(solicitud.trayectoria.timestamp_estimado).toLocaleDateString("es-AR", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })} hs
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mb-1">CONDICIONES CLIMÁTICAS</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 dark:text-slate-400">🌡️ {solicitud.trayectoria.condiciones_climaticas.temperatura_c}°C</span>
                    <span className="text-slate-600 dark:text-slate-400">💨 {solicitud.trayectoria.condiciones_climaticas.velocidad_viento_ms} m/s</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      solicitud.trayectoria.condiciones_seguras
                        ? "bg-green-50 dark:bg-green-950/25 text-green-600 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400"
                    }`}>
                      {solicitud.trayectoria.condiciones_seguras ? "✅ Seguro" : "❌ No seguro"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Línea de tiempo</h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-6 space-y-5">
              {solicitud.historial?.length === 0 ? (
                <p className="text-xs text-slate-400">Sin historial registrado.</p>
              ) : (
                solicitud.historial?.map((h: any, idx: number) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[26px] top-0.5 bg-white dark:bg-slate-900 border-2 border-brand w-3.5 h-3.5 rounded-full" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{h.estadoNuevo}</p>
                    <p className="text-slate-400 text-[11px]">{formatDate(h.fechaHora)} por {h.actorId?.substring(0, 8)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Acciones</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Avanzá el estado de la solicitud según el progreso real.
            </p>

            {currentStepIndex >= 0 && currentStepIndex < STATUS_FLOW.length - 1 && (
              <button
                onClick={() => ejecutarAccion(STATUS_FLOW[currentStepIndex + 1])}
                disabled={accionEjecutando !== null}
                className="w-full bg-brand text-white font-semibold py-2.5 px-4 rounded-lg text-xs hover:bg-orange-600 transition-colors disabled:opacity-50 cursor-pointer mb-2"
              >
                {accionEjecutando === STATUS_FLOW[currentStepIndex + 1] ? "Procesando..." : `Marcar como "${STATUS_FLOW[currentStepIndex + 1]}"`}
              </button>
            )}

            {puedeAnular && (
              <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4">
                <button
                  onClick={() => setMostrarModalAnular(true)}
                  disabled={accionEjecutando !== null}
                  className="w-full bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 font-semibold py-2 px-4 rounded-lg text-xs hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {accionEjecutando === "anular" ? "Anulando..." : "Anular solicitud"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">Stock en base</h2>
            <div className="space-y-2 text-xs">
              {Object.keys(stockBase).length === 0 ? (
                <p className="text-slate-400">Cargando stock...</p>
              ) : (
                Object.entries(stockBase).map(([productoId, item]) => (
                  <div key={productoId} className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{item.nombreProducto || productoId}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.cantidad_disponible} unid.</span>
                  </div>
                ))
              )}
              <button
                onClick={() => router.push("/remitente/stock")}
                className="w-full mt-3 text-brand font-semibold text-xs hover:underline bg-transparent border-none cursor-pointer"
              >
                Ir a stock →
              </button>
            </div>
          </div>
        </div>
      </div>

      {mostrarModalAnular && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Anular solicitud</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Ingresá el motivo de anulación. Esta acción no se puede deshacer.
            </p>
            <textarea
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              placeholder="Motivo de anulación (obligatorio)..."
              rows={3}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setMostrarModalAnular(false); setMotivoAnulacion(""); }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAnulacion}
                disabled={!motivoAnulacion.trim() || accionEjecutando === "anular"}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                {accionEjecutando === "anular" ? "Anulando..." : "Confirmar anulación"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
