"use client";

import React, { useState } from "react";
import Button from "@/app/components/ui/Button";
import UsuariosTable from "./UsuariosTable";
import ModalCrearUsuario from "./ModalCrearUsuario";

interface UsuarioRow {
  id: string;
  estadoCuenta: string;
  rol: string;
  nombre: string | null;
}

export default function AdminUsuariosClient({ usuarios }: { usuarios: UsuarioRow[] }) {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7f6] dark:bg-slate-950 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b] dark:text-white tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-[#64748b] dark:text-slate-400 mt-1 text-sm md:text-base">
              Administración de cuentas, roles y permisos de acceso en el sistema.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setMostrarModal(true)}>
            + Nuevo Usuario
          </Button>
        </div>

        {/* Tabla */}
        <UsuariosTable usuarios={usuarios} />

        {/* Modal */}
        {mostrarModal && (
          <ModalCrearUsuario
            onClose={() => setMostrarModal(false)}
            onCreated={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}
