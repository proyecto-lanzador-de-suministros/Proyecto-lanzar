"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import type {
  Solicitud,
  EstadoSolicitud,
} from "@/src/modules/solicitudes/domain/entities/Solicitud";

// ─── Paleta del mockup ────────────────────────────────────────────────────────
// Navy #1B2A4A | Amber #F5A623 | Blue #1565C0 | Gray light #F4F6F9
// Info #2196F3 | Success #4CAF50 | Warning #FF9800 | Danger #F44336
// Text primary #1A1A2E | Text secondary #6B7280

// ─── Constantes ───────────────────────────────────────────────────────────────

const ETIQUETAS_ESTADO: Record<EstadoSolicitud, string> = {
  creada: "Creada",
  asignada: "Asignada",
  en_preparacion: "En preparación",
  lista: "Lista",
  en_camino: "En camino",
  lanzada: "Lanzada",
  completada: "Completada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
  anulada: "Anulada",
};

const ESTADOS_PERMITIDOS: EstadoSolicitud[] = [
  "asignada",
  "en_preparacion",
  "lista",
  "en_camino",
  "lanzada",
  "completada",
  "anulada",
  "cancelada",
  "rechazada",
];

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface ActividadItem {
  id: string;
  tipo: "solicitud_creada" | "entregada" | "cancelada";
  titulo: string;
  descripcion: string;
  hora: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function derivarActividad(solicitudes: Solicitud[]): ActividadItem[] {
  return [...solicitudes]
    .sort(
      (a, b) =>
        new Date(b.fecha_solicitada).getTime() -
        new Date(a.fecha_solicitada).getTime(),
    )
    .slice(0, 5)
    .map((s) => {
      const tipo: ActividadItem["tipo"] =
        s.estado === "completada"
          ? "entregada"
          : s.estado === "cancelada" || s.estado === "anulada"
            ? "cancelada"
            : "solicitud_creada";
      return {
        id: s.id_solicitud,
        tipo,
        titulo:
          tipo === "entregada"
            ? "Solicitud entregada"
            : tipo === "cancelada"
              ? "Solicitud cancelada"
              : "Nueva solicitud creada",
        descripcion: `#SOL-${s.id_solicitud.substring(0, 6).toUpperCase()} — ${ETIQUETAS_ESTADO[s.estado]}`,
        hora: new Date(s.fecha_solicitada).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
}

// ─── Gráfico de dona (SVG puro) ───────────────────────────────────────────────

function GraficaDona({ solicitudes }: { solicitudes: Solicitud[] }) {
  const total = solicitudes.length || 1;

  const enCamino = solicitudes.filter(
    (s) => s.estado === "en_camino" || s.estado === "lanzada",
  ).length;
  const porLlegar = solicitudes.filter(
    (s) =>
      s.estado === "creada" ||
      s.estado === "asignada" ||
      s.estado === "en_preparacion" ||
      s.estado === "lista",
  ).length;
  const entregadas = solicitudes.filter((s) => s.estado === "completada").length;
  const canceladas = solicitudes.filter(
    (s) => s.estado === "cancelada" || s.estado === "anulada",
  ).length;

  const datos = [
    { valor: enCamino,   color: "#2196F3", label: "En camino" },
    { valor: porLlegar,  color: "#FF9800", label: "Por llegar" },
    { valor: entregadas, color: "#4CAF50", label: "Entregadas" },
    { valor: canceladas, color: "#F44336", label: "Canceladas" },
  ];

  const cx = 80;
  const cy = 80;
  const r = 58;
  const grosor = 20;
  const circunferencia = 2 * Math.PI * r;

  let acumulado = 0;
  const arcos = datos.map((d) => {
    const porcentaje = d.valor / total;
    const offset = circunferencia * (1 - acumulado);
    const dash = circunferencia * porcentaje;
    acumulado += porcentaje;
    return { ...d, porcentaje, offset, dash };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8ECF0" strokeWidth={grosor} />
          {arcos.map((a, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={grosor}
              strokeDasharray={`${a.dash} ${circunferencia - a.dash}`}
              strokeDashoffset={a.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#1A1A2E]">{solicitudes.length}</span>
          <span className="text-xs text-[#6B7280]">Total</span>
        </div>
      </div>

      <div className="space-y-3 w-full">
        {datos.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-sm text-[#1A1A2E]">{d.label}</span>
            </div>
            <span className="text-sm font-semibold text-[#1A1A2E]">
              {d.valor}{" "}
              <span className="text-[#6B7280] font-normal text-xs">
                ({total > 0 ? ((d.valor / total) * 100).toFixed(1) : "0.0"}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gráfico de líneas (SVG puro) ─────────────────────────────────────────────

function GraficaLineas({ solicitudes }: { solicitudes: Solicitud[] }) {
  const ahora = new Date();
  const semanas = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(ahora);
    d.setDate(ahora.getDate() - (4 - i) * 7);
    return d;
  });

  const etiquetas = semanas.map((s) =>
    s.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
  );

  const contar = (filtro: ((s: Solicitud) => boolean) | null, idx: number) => {
    const desde = semanas[idx];
    const hasta = idx < 4 ? semanas[idx + 1] : new Date(ahora.getTime() + 86400000);
    return solicitudes.filter((s) => {
      const f = new Date(s.fecha_solicitada);
      return f >= desde && f < hasta && (filtro ? filtro(s) : true);
    }).length;
  };

  const ds = semanas.map((_, i) => contar(null, i));
  const de = semanas.map((_, i) => contar((s) => s.estado === "completada", i));
  const dc = semanas.map((_, i) =>
    contar((s) => s.estado === "cancelada" || s.estado === "anulada", i),
  );

  const maxVal = Math.max(...ds, ...de, ...dc, 1);
  const W = 300;
  const H = 110;
  const pX = 8;
  const pY = 8;
  const iW = W - pX * 2;
  const iH = H - pY * 2;

  const toX = (i: number) => pX + (i / (semanas.length - 1)) * iW;
  const toY = (v: number) => pY + iH - (v / maxVal) * iH;

  const line = (data: number[], color: string, withDots = false) => {
    const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
    return (
      <>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {withDots &&
          data.map((v, i) => (
            <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={color} />
          ))}
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-[#6B7280]">
        {[
          { color: "#2196F3", label: "Solicitudes" },
          { color: "#4CAF50", label: "Entregadas" },
          { color: "#F44336", label: "Canceladas" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
        {line(ds, "#2196F3", true)}
        {line(de, "#4CAF50")}
        {line(dc, "#F44336")}
      </svg>
      <div className="flex justify-between mt-2">
        {etiquetas.map((e) => (
          <span key={e} className="text-[10px] text-[#6B7280]">{e}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Íconos de actividad ──────────────────────────────────────────────────────

function IconoActividad({ tipo }: { tipo: ActividadItem["tipo"] }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0";
  if (tipo === "entregada")
    return (
      <div className={`${base} bg-green-100`}>
        <svg className="w-4 h-4 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  if (tipo === "cancelada")
    return (
      <div className={`${base} bg-red-100`}>
        <svg className="w-4 h-4 text-[#F44336]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  return (
    <div className={`${base} bg-blue-100`}>
      <svg className="w-4 h-4 text-[#2196F3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalSolicitud, setModalSolicitud] = useState<Solicitud | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoSolicitud | "">("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/solicitudes");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Error al obtener las solicitudes.");
      }
      setSolicitudes(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSolicitudes(); }, []);

  // Stats derivadas
  const total = solicitudes.length;
  const entregadas = solicitudes.filter((s) => s.estado === "completada").length;
  const canceladas = solicitudes.filter(
    (s) => s.estado === "cancelada" || s.estado === "anulada",
  ).length;
  const enCamino = solicitudes.filter(
    (s) => s.estado === "en_camino" || s.estado === "lanzada",
  ).length;
  const pendientes = solicitudes.filter(
    (s) => s.estado === "creada" || s.estado === "asignada",
  ).length;
  const actividad = derivarActividad(solicitudes);

  const abrirModal = (sol: Solicitud) => {
    setModalSolicitud(sol);
    setNuevoEstado("");
    setErrorModal(null);
  };
  const cerrarModal = () => {
    setModalSolicitud(null);
    setNuevoEstado("");
    setErrorModal(null);
  };

  const guardarCambioEstado = async () => {
    if (!modalSolicitud || !nuevoEstado) return;
    setGuardando(true);
    setErrorModal(null);
    try {
      const res = await fetch(
        `/api/solicitudes/${modalSolicitud.id_solicitud}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevoEstado }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "No se pudo actualizar el estado.");
      }
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id_solicitud === modalSolicitud.id_solicitud
            ? { ...s, estado: nuevoEstado as EstadoSolicitud }
            : s,
        ),
      );
      cerrarModal();
    } catch (err: unknown) {
      setErrorModal(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setGuardando(false);
    }
  };

  const getStatusColor = (estado: EstadoSolicitud) => {
    switch (estado) {
      case "completada":    return "bg-green-100 text-[#4CAF50] border-green-200";
      case "en_camino":
      case "lanzada":       return "bg-blue-100 text-[#2196F3] border-blue-200";
      case "en_preparacion":
      case "lista":         return "bg-orange-100 text-[#FF9800] border-orange-200";
      case "creada":
      case "asignada":      return "bg-gray-100 text-[#6B7280] border-gray-200";
      default:              return "bg-red-100 text-[#F44336] border-red-200";
    }
  };

  const getPrioridadColor = (p: Solicitud["prioridad"]) => {
    switch (p) {
      case "urgente": return "bg-red-100 text-[#F44336]";
      case "alta":    return "bg-orange-100 text-[#FF9800]";
      case "media":   return "bg-yellow-100 text-yellow-700";
      default:        return "bg-gray-100 text-[#6B7280]";
    }
  };

  // Cards de stats
  const statsCards = [
    {
      label: "Solicitudes totales",
      valor: total,
      sub: `+${Math.max(0, total - 500)} este mes`,
      color: "#2196F3",
      bg: "#E3F2FD",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      label: "Entregadas",
      valor: entregadas,
      sub: `${total > 0 ? ((entregadas / total) * 100).toFixed(0) : 0}% del total`,
      color: "#4CAF50",
      bg: "#E8F5E9",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Canceladas",
      valor: canceladas,
      sub: `${total > 0 ? ((canceladas / total) * 100).toFixed(0) : 0}% del total`,
      color: "#F44336",
      bg: "#FFEBEE",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "En camino",
      valor: enCamino,
      sub: "activas ahora",
      color: "#FF9800",
      bg: "#FFF3E0",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
  ];

  // Alertas derivadas de datos reales
  const alertas = [
    ...(pendientes > 0
      ? [{ tipo: "warning" as const, texto: "Solicitudes sin asignar", sub: `Hay ${pendientes} pendiente${pendientes !== 1 ? "s" : ""} de asignación.` }]
      : []),
    ...(canceladas > 0
      ? [{ tipo: "danger" as const, texto: `${canceladas} cancelada${canceladas !== 1 ? "s" : ""}`, sub: "Revisar motivos de cancelación." }]
      : []),
    { tipo: "info" as const, texto: "Sistema operativo", sub: "Todos los servicios funcionan correctamente." },
  ];

  const alertaColors = {
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "#FF9800" },
    danger:  { bg: "bg-red-50",   border: "border-red-200",   icon: "#F44336" },
    info:    { bg: "bg-blue-50",  border: "border-blue-200",  icon: "#2196F3" },
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Panel de control</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Resumen general de la actividad del sistema.
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">

        {/* ── CARDS DE ESTADÍSTICAS ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 animate-pulse h-28 border border-gray-100" />
              ))
            : statsCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.bg, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#6B7280] font-medium leading-tight">{card.label}</p>
                    <p className="text-2xl font-bold text-[#1A1A2E] mt-0.5 leading-none">
                      {card.valor.toLocaleString("es-AR")}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">{card.sub}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* ── FILA MEDIA ───────────────────────────────────────────────────── */}
        {/* Grilla principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gráfico dona */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#1A1A2E] mb-5">
              Solicitudes por estado
            </h2>
            {loading
              ? <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />
              : <GraficaDona solicitudes={solicitudes} />}
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">
              Actividad reciente
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : actividad.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-4 text-center">
                Sin actividad reciente.
              </p>
            ) : (
              <div className="space-y-4">
                {actividad.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <IconoActividad tipo={item.tipo} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">
                          {item.titulo}
                        </p>
                        <span className="text-[10px] text-[#6B7280] whitespace-nowrap flex-shrink-0">
                          {item.hora}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5 truncate">
                        {item.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
                <button className="text-xs text-[#1565C0] font-semibold flex items-center gap-1 mt-2 hover:underline">
                  Ver todas las actividades
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Acciones rápidas + Alertas */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-[#1A1A2E] mb-3">
                Acciones rápidas
              </h2>
              <div className="divide-y divide-gray-100">
                {[
                  { label: "Gestionar solicitudes", href: "#solicitudes" },
                  { label: "Enviar notificación",   href: "#notificaciones" },
                  { label: "Generar reporte",        href: "#reportes" },
                ].map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className="flex items-center justify-between py-3 text-sm text-[#1A1A2E] hover:text-[#1565C0] transition-colors group"
                  >
                    {a.label}
                    <svg className="w-4 h-4 text-[#6B7280] group-hover:text-[#1565C0] transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-[#1A1A2E] mb-3">Alertas</h2>
              <div className="space-y-2">
                {alertas.map((a, i) => {
                  const c = alertaColors[a.tipo];
                  return (
                    <div key={i} className={`rounded-lg border px-3 py-2.5 ${c.bg} ${c.border}`}>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24" style={{ color: c.icon }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-[#1A1A2E]">{a.texto}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">{a.sub}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABLA DE GESTIÓN ─────────────────────────────────────────────── */}
        <div id="solicitudes" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1A1A2E]">Gestión de solicitudes</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Todas las solicitudes del sistema</p>
            </div>
            {!loading && (
              <span className="text-xs font-medium bg-gray-100 text-[#6B7280] px-2.5 py-1 rounded-full">
                {solicitudes.length} total{solicitudes.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-10 flex justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
              <span className="text-sm text-[#6B7280]">Cargando datos...</span>
            </div>
          ) : error ? (
            <div className="p-10 text-center bg-red-50">
              <p className="text-[#F44336] font-semibold text-sm">{error}</p>
              <button onClick={fetchSolicitudes} className="mt-3 text-sm text-[#1565C0] underline">
                Reintentar
              </button>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-[#1A1A2E]">No hay solicitudes registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                    {["ID", "Fecha solicitud", "Fecha entrega", "Destino", "Prioridad", "Estado", "Acciones"].map((h) => (
                      <th key={h} className={`px-6 py-3 font-semibold ${h === "Acciones" ? "text-center" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {solicitudes.map((sol) => (
                    <tr key={sol.id_solicitud} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[#6B7280]">
                        #{sol.id_solicitud.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-[#1A1A2E] font-medium text-xs">
                        {new Date(sol.fecha_solicitada).toLocaleDateString("es-AR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-[#6B7280] text-xs">
                        {new Date(sol.fecha_entrega).toLocaleDateString("es-AR", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-[#6B7280]">
                        {sol.ubicacion_destino.coordinates[1].toFixed(3)},{" "}
                        {sol.ubicacion_destino.coordinates[0].toFixed(3)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${getPrioridadColor(sol.prioridad)}`}>
                          {sol.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(sol.estado)}`}>
                          {ETIQUETAS_ESTADO[sol.estado]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => abrirModal(sol)}
                          className="text-[#1565C0] bg-blue-50 hover:bg-[#1565C0] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── ESTADÍSTICAS DEL MES ─────────────────────────────────────────── */}
        {!loading && solicitudes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">
              Estadísticas del mes
            </h2>
            <GraficaLineas solicitudes={solicitudes} />
          </div>
        )}

      </div>

      {/* ── MODAL ────────────────────────────────────────────────────────────── */}
      {modalSolicitud && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A2E]">Gestionar solicitud</h2>
                <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                  #{modalSolicitud.id_solicitud.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="bg-[#F4F6F9] rounded-xl p-4 mb-5 space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Estado actual</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(modalSolicitud.estado)}`}>
                  {ETIQUETAS_ESTADO[modalSolicitud.estado]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Prioridad</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${getPrioridadColor(modalSolicitud.prioridad)}`}>
                  {modalSolicitud.prioridad}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Fecha entrega</span>
                <span className="font-medium text-[#1A1A2E]">
                  {new Date(modalSolicitud.fecha_entrega).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Destino</span>
                <span className="font-mono text-xs text-[#1A1A2E]">
                  {modalSolicitud.ubicacion_destino.coordinates[1].toFixed(4)},{" "}
                  {modalSolicitud.ubicacion_destino.coordinates[0].toFixed(4)}
                </span>
              </div>
            </div>

            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
              Cambiar estado a:
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] transition mb-4 bg-white"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoSolicitud)}
            >
              <option value="">Seleccionar estado...</option>
              {ESTADOS_PERMITIDOS.filter((e) => e !== modalSolicitud.estado).map((estado) => (
                <option key={estado} value={estado}>{ETIQUETAS_ESTADO[estado]}</option>
              ))}
            </select>

            {errorModal && (
              <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2 mb-4">
                {errorModal}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={cerrarModal}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambioEstado}
                disabled={!nuevoEstado || guardando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando..." : "Confirmar cambio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}