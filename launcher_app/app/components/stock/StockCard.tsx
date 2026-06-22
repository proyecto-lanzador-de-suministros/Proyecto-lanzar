"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/app/components/ui/ProgressBar";
import { consultarStockBaseAction } from "@/src/actions/stock.actions";
import { obtenerMiBaseAction } from "@/src/actions/remitente-acciones.actions";

export default function StockCard() {
  const router = useRouter();
  const [disponibles, setDisponibles] = useState(0);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const baseRes = await obtenerMiBaseAction();
      if (!baseRes.success || !baseRes.data?.id_base) return;
      const stockRes = await consultarStockBaseAction(baseRes.data.id_base);
      if (stockRes.success && stockRes.data) {
        const totalStock = stockRes.data.reduce((acc: number, item: any) => acc + item.cantidad_disponible + item.cantidad_reservada, 0);
        setDisponibles(stockRes.data.reduce((acc: number, item: any) => acc + item.cantidad_disponible, 0));
        setTotal(totalStock || disponibles);
      }
      setLoaded(true);
    })();
  }, []);

  if (!loaded) {
    return (
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 animate-pulse h-40" />
    );
  }

  const porcentaje = total > 0 ? Math.round((disponibles / total) * 100) : 0;
  const variant = porcentaje > 50 ? "success" : porcentaje > 20 ? "warning" : "danger";

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 dark:text-slate-500"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Mi stock
          </h2>
        </div>
        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Ver historial
        </button>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
        Paracaídas disponibles
      </p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
        {disponibles}{" "}
        <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
          unidades
        </span>
      </p>

      <ProgressBar value={porcentaje} variant={variant} className="mb-4.5" />

      <button
        onClick={() => router.push("/remitente/stock")}
        className="mt-1 w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--color-interactive)] text-[var(--color-interactive)] text-sm font-medium py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Actualizar stock
      </button>
    </section>
  );
}
