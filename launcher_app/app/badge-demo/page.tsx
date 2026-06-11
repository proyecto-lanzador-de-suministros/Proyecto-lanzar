"use client";

import Badge from "../components/ui/Badge";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo Badge</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="solicitante">Solicitante</Badge>
        <Badge variant="remitente">Remitente</Badge>
        <Badge>Default</Badge>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Badge variant="solicitante" className="uppercase">
          Usuario
        </Badge>
        <Badge variant="remitente" className="tracking-wide">
          Remitente
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          Este ejemplo muestra los badges con los colores definidos en
          <code>app/globals.css</code>.
        </p>
      </div>
    </div>
  );
}