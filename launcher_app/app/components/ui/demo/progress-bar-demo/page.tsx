"use client";

import ProgressBar from "../../ProgressBar";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo ProgressBar</h1>

      <div className="space-y-4 max-w-xl">
        <ProgressBar label="Carga en curso" value={45} />
        <ProgressBar label="Completado" value={100} variant="success" />
        <ProgressBar label="Advertencia" value={68} variant="warning" />
        <ProgressBar label="Error" value={32} variant="danger" />
      </div>

      <p className="max-w-2xl text-sm text-slate-600">
        ProgressBar muestra el valor con barra y porcentaje. El prop <code>variant</code> cambia el color.
      </p>
    </div>
  );
}
