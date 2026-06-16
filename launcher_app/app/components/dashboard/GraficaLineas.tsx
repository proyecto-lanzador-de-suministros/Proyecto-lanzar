// Gráfico de líneas (SVG puro) con la evolución semanal de solicitudes, entregas y cancelaciones.
import React from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { SolicitudJSON } from "./types";

interface GraficaLineasProps {
  solicitudes: SolicitudJSON[];
}

export default function GraficaLineas({ solicitudes }: GraficaLineasProps) {
  const ahora = new Date();
  const semanas = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(ahora);
    d.setDate(ahora.getDate() - (4 - i) * 7);
    return d;
  });

  const etiquetas = semanas.map((s) =>
    s.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
  );

  const contar = (filtro: ((s: SolicitudJSON) => boolean) | null, idx: number) => {
    const desde = semanas[idx];
    const hasta = idx < 4 ? semanas[idx + 1] : new Date(ahora.getTime() + 86400000);
    return solicitudes.filter((s) => {
      const f = new Date(s.fechaCreacion);
      return f >= desde && f < hasta && (filtro ? filtro(s) : true);
    }).length;
  };

  const ds = semanas.map((_, i) => contar(null, i));
  const de = semanas.map((_, i) =>
    contar((s) => s.estado === EstadoSolicitud.Completada, i),
  );
  const dc = semanas.map((_, i) =>
    contar(
      (s) => s.estado === EstadoSolicitud.Cancelada || s.estado === EstadoSolicitud.Anulada,
      i,
    ),
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
        {etiquetas.map((e, i) => (
          <span key={`${e}-${i}`} className="text-[10px] text-[#6B7280]">{e}</span>
        ))}
      </div>
    </div>
  );
}