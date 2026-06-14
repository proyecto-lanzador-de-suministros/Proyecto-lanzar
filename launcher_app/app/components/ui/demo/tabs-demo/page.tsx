"use client";

import { useState } from "react";
import Tabs from "../../Tabs";

const tabItems = [
  { label: "Resumen", value: "overview" },
  { label: "Actividad", value: "activity" },
  { label: "Ajustes", value: "settings", disabled: true },
];

export default function Page() {
  const [value, setValue] = useState("overview");

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo Tabs</h1>

      <Tabs items={tabItems} value={value} onValueChange={setValue} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">Contenido activo: <strong>{value}</strong></p>
      </div>

      <p className="max-w-2xl text-sm text-slate-600">
        Las pestañas muestran el estado seleccionado y deshabilitan la pestaña de Ajustes.
      </p>
    </div>
  );
}
