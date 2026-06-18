"use client";

import dynamic from "next/dynamic";

const CoverageMapContent = dynamic(
  () => import("./CoverageMapContent"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700"
        style={{ minHeight: "380px" }}
      >
        <span className="text-slate-400 dark:text-slate-500 font-semibold text-sm">
          Cargando mapa de cobertura...
        </span>
      </div>
    ),
  }
);

interface CoverageMapProps {
  onSelectPoint?: (lat: number, lng: number) => void;
  selectedPoint?: { lat: number; lng: number } | null;
}

export default function CoverageMap({ onSelectPoint, selectedPoint }: CoverageMapProps) {
  return <CoverageMapContent onSelectPoint={onSelectPoint} selectedPoint={selectedPoint ?? null} />;
}
