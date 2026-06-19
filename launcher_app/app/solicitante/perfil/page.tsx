"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SolicitanteProfilePage() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Mi Perfil</h1>
          <p className="text-[#64748b] mt-1 text-sm md:text-base">
            Gestiona tu información personal y credenciales de acceso (Solicitante).
          </p>
        </div>

        {/* Contenedor del componente de Clerk */}
        <div className="flex justify-center">
          <UserProfile 
            routing="hash"
            appearance={{
              elements: {
                card: "shadow-sm border border-gray-200 rounded-2xl",
                navbar: "bg-gray-50 rounded-l-2xl",
                navbarButton: "text-gray-600 hover:text-[#f97316]",
                navbarButton__active: "text-[#f97316] bg-orange-50",
                headerTitle: "text-[#1e293b]",
                headerSubtitle: "text-gray-500",
                profileSectionTitleText: "text-[#1e293b] font-semibold",
                badge: "text-[#f97316] bg-orange-50",
                primaryButton: "bg-[#f97316] hover:bg-[#ea580c] text-white",
              }
            }}
          />
        </div>

      </div>
    </div>
  );
}
