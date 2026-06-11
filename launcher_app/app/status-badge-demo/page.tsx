"use client";

import React from "react";
import StatusBadge from "../components/ui/StatusBadge";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo StatusBadge</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <StatusBadge variant="info">Info</StatusBadge>
        <StatusBadge variant="success">Success</StatusBadge>
        <StatusBadge variant="warning">Warning</StatusBadge>
        <StatusBadge variant="danger">Danger</StatusBadge>
        <StatusBadge>Default</StatusBadge>
      </div>

      <div className="space-y-2 max-w-2xl text-sm text-slate-600">
        <p>
          Esta página muestra los diferentes estilos de <strong>StatusBadge</strong>.
          Los colores se basan en las variables globales definidas en <code>app/globals.css</code>.
        </p>
        <p>
        </p>
      </div>
    </div>
  );
}
