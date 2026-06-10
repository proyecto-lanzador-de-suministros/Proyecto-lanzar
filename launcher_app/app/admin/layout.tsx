"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Función auxiliar para saber qué pestaña está activa y pintarla de naranja
  const isActive = (path: string) => {
    return pathname === path 
      ? "bg-orange-50 text-[#f97316] border-r-4 border-[#f97316]" 
      : "text-gray-600 hover:bg-gray-50 hover:text-[#f97316] transition-colors";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f4f7f6]">
      
      {/* SIDEBAR LATERAL (Menú de navegación) */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        
        {/* Logo / Título */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between md:justify-start">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-[#1e293b]">
              Lanzar<span className="text-[#f97316]">App</span>
            </h2>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
              Portal Admin
            </p>
          </div>
          
          {/* UserButton de Clerk para móvil (se oculta en pantallas grandes) */}
          <div className="md:hidden">
            <UserButton />
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 py-6 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center px-6 py-4 text-sm font-semibold whitespace-nowrap ${isActive('/admin/dashboard')}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Gestión de Pedidos
          </Link>

          <Link 
            href="/admin/perfil" 
            className={`flex items-center px-6 py-4 text-sm font-semibold whitespace-nowrap ${isActive('/admin/perfil')}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi Perfil
          </Link>
          
        </nav>

        {/* UserButton de Clerk para Escritorio (se ubica abajo a la izquierda) */}
        <div className="hidden md:flex p-6 border-t border-gray-100 items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium text-gray-700">Administrador</span>
        </div>

      </aside>

      {/* CONTENIDO PRINCIPAL (Acá adentro se renderiza el Dashboard o el Perfil) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      
    </div>
  );
}