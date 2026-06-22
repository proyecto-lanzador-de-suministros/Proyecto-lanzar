"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import {
  consultarDetalleSolicitudSolicitanteAction,
  cancelarSolicitudAction,
  confirmarRecibidaAction,
  obtenerProductosAction,
} from "@/src/actions/solicitudes.actions";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Button from "@/app/components/ui/Button";

type CatalogoProducto = {
  id_producto: string;
  nombre: string;
  descripcion: string | null;
  peso_kg: number;
};

const ESTADO_ICONO: Record<string, string> = {
  Creada: "🟡",
  Asignada: "🔵",
  "En preparación": "🟠",
  Lista: "🟠",
  "En camino": "🟣",
  Lanzada: "🟣",
  Completada: "🟢",
  Cancelada: "🔴",
  Anulada: "🔴",
  Rechazada: "🔴",
};

function getStatusDisplay(est: EstadoSolicitud) {
  switch (est) {
    case EstadoSolicitud.EnCamino:
    case EstadoSolicitud.Lanzada:
      return { text: "En camino", variant: "info" as const };
    case EstadoSolicitud.Completada:
      return { text: "Entregado", variant: "success" as const };
    case EstadoSolicitud.Cancelada:
    case EstadoSolicitud.Anulada:
    case EstadoSolicitud.Rechazada:
      return { text: "Cancelado", variant: "danger" as const };
    default:
      return { text: "Por llegar", variant: "warning" as const };
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " - " +
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) +
    " hs"
  );
}

export default function SolicitanteSolicitudPage() {
  const router = useRouter();
  const params = useParams();
  const solicitudId = params.id as string;

  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<any>(null);
  const [productos, setProductos] = useState<CatalogoProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal cancelar
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Confirmar recepción
  const [confirming, setConfirming] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resDetalle, resProductos] = await Promise.all([
        consultarDetalleSolicitudSolicitanteAction(solicitudId),
        obtenerProductosAction(),
      ]);

      if (resDetalle.success && resDetalle.data) {
        setData({
          ...resDetalle.data,
          ubicacion_destino: {
            ...resDetalle.data.ubicacion_destino,
            coordinates: [
              Number(resDetalle.data.ubicacion_destino.coordinates[0]),
              Number(resDetalle.data.ubicacion_destino.coordinates[1]),
            ],
          },
        });
      } else {
        setError(resDetalle.error || "No se pudo cargar la solicitud.");
      }

      if (resProductos.success && resProductos.data) {
        setProductos(resProductos.data);
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      if (solicitudId) fetchData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudId]);

  function getNombreProducto(productoId: string) {
    return (
      productos.find((p) => p.id_producto === productoId)?.nombre ?? productoId
    );
  }

  function handleConfirmCancel() {
    startTransition(async () => {
      const res = await cancelarSolicitudAction(solicitudId, cancelReason);
      if (res.success) {
        setShowCancelModal(false);
        await fetchData();
      } else {
        alert("Error al cancelar: " + res.error);
      }
    });
  }

  function handleConfirmarRecepcion() {
    startTransition(async () => {
      const res = await confirmarRecibidaAction(solicitudId);
      if (res.success) {
        setConfirming(false);
        await fetchData();
      } else {
        alert("Error al confirmar recepción: " + res.error);
      }
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {error || "Solicitud no encontrada."}
        </div>
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(data.estado);
  const puedeConfirmar = data.estado === EstadoSolicitud.Lanzada;

  return (
    <div className="flex flex-col gap-6 font-sans max-w-2xl">
      {/* Botón volver */}
      <button
        onClick={() => router.push("/solicitante/missolicitudes")}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-fit"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver a mis solicitudes
      </button>

      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-slate-400 mb-1">
            Solicitud #{data.id.substring(0, 8).toUpperCase()}
          </p>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Detalle del pedido
          </h1>
        </div>
        <StatusBadge variant={statusInfo.variant}>
          {statusInfo.text}
        </StatusBadge>
      </div>

      {/* Info general */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <InfoRow label="Estado actual" value={data.estado} />
        <InfoRow label="Prioridad" value={data.prioridad} />
        <InfoRow
          label="Destino"
          value={`Lat: ${data.ubicacion_destino.coordinates[1].toFixed(5)}, Lng: ${data.ubicacion_destino.coordinates[0].toFixed(5)}`}
        />
        <InfoRow
          label="Fecha de solicitud"
          value={formatDate(data.fechaSolicitada)}
        />
        {data.fechaEntrega && (
          <InfoRow
            label="Fecha de entrega"
            value={formatDate(data.fechaEntrega)}
          />
        )}
        {data.motivoCancelacion && (
          <InfoRow
            label="Motivo de cancelación"
            value={data.motivoCancelacion}
            danger
          />
        )}
        {data.motivoAnulacion && (
          <InfoRow
            label="Motivo de anulación"
            value={data.motivoAnulacion}
            danger
          />
        )}
      </div>

      {/* Productos */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Suministros solicitados
        </h2>
        <ul className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {data.productos.map((p: any, i: number) => (
            <li
              key={i}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-slate-700 dark:text-slate-300">
                {getNombreProducto(p.productoId)}
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                ×{p.cantidad}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Historial de estados */}
      {data.historial?.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Historial de estados
          </h2>
          <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 flex flex-col gap-4 py-1">
            {data.historial.map((h: any) => (
              <li key={h.id} className="ml-5 relative">
                <span className="absolute -left-[27px] top-0.5 text-sm">
                  {ESTADO_ICONO[h.estadoNuevo] ?? "⚪"}
                </span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {h.estadoAnterior ? `${h.estadoAnterior} → ` : ""}
                  {h.estadoNuevo}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(h.fechaHora)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        {puedeConfirmar && !confirming && (
          <Button
            onClick={() => setConfirming(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Confirmar recepción
          </Button>
        )}

        {data.puedeSerCancelada && (
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(true)}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
          >
            Cancelar solicitud
          </Button>
        )}
      </div>

      {/* Confirmación de recepción inline */}
      {confirming && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            ¿Confirmás que recibiste el paquete?
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarRecepcion}
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? "Confirmando..." : "Sí, lo recibí"}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Cancelar solicitud
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                ¿Estás seguro de que deseas cancelar esta solicitud? Esta acción
                liberará las provisiones reservadas.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 dark:text-slate-500 font-semibold mb-1">
                Motivo de la cancelación (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Escribí el motivo aquí..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-3 text-xs">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isPending}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold"
              >
                No, mantener
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
              >
                {isPending ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-right max-w-xs ${
          danger
            ? "text-red-600 dark:text-red-400"
            : "text-slate-800 dark:text-slate-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
