"use client";

import NavItem from "../../NavItem";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo NavItem</h1>

      <div className="flex flex-col gap-2 max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <NavItem href="/inicio" label="Inicio" active />
        <NavItem href="/solicitudes" label="Solicitudes" badge={7} />
        <NavItem href="/perfil" label="Perfil" />
      </div>

      <p className="max-w-2xl text-sm text-slate-600">
        NavItem muestra el texto principal y un contador opcional; el estado activo cambia el estilo.
      </p>
    </div>
  );
}
