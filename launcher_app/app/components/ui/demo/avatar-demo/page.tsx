"use client";

import Avatar from "../../Avatar";

export default function Page() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Demo Avatar</h1>

      <div className="flex items-center gap-4">
        <Avatar alt="Juan Perez" />
        <Avatar src="/avatar.jpg" alt="Imagen de avatar" />
        <Avatar size="lg" alt="Andrea Lopez" />
      </div>

      <p className="max-w-2xl text-sm text-slate-600">
        Avatar usa la imagen si se proporciona <code>src</code>, o muestra iniciales con fondo neutro.
      </p>
    </div>
  );
}
