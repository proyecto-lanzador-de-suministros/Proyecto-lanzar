"use client";

import React from "react";
import Badge from "../../Badge";
import StatusBadge from "../../StatusBadge";

export default function Page() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Demo Badge + StatusBadge</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Aquí se muestran los componentes <strong>Badge</strong> y <strong>StatusBadge</strong> en conjunto,
          para comparar su estilo y uso en el mismo diseño.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">User badges</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="solicitante">Solicitante</Badge>
          <Badge variant="remitente">Remitente</Badge>
          <Badge>Default</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Status badges</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <StatusBadge variant="info">Info</StatusBadge>
          <StatusBadge variant="success">Success</StatusBadge>
          <StatusBadge variant="warning">Warning</StatusBadge>
          <StatusBadge variant="danger">Danger</StatusBadge>
          <StatusBadge>Default</StatusBadge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Combinación visual</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-700">Solicitud abierta</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="solicitante">Solicitante</Badge>
              <StatusBadge variant="warning">Pending</StatusBadge>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-medium text-slate-700">Solicitud completada</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="remitente">Remitente</Badge>
              <StatusBadge variant="success">Completed</StatusBadge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
