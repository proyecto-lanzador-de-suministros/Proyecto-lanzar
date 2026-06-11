"use client";

import DropdownTrigger from "../../DropdownTrigger";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo DropdownTrigger</h1>

      <div className="flex flex-wrap gap-4">
        <DropdownTrigger>Open menu</DropdownTrigger>
        <DropdownTrigger disabled>Disabled</DropdownTrigger>
      </div>

      <p className="max-w-2xl text-sm text-slate-600">
        Este componente es el disparador visual para un menú desplegable, con estados normales y deshabilitados.
      </p>
    </div>
  );
}
