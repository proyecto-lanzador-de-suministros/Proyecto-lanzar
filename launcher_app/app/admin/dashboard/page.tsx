"use client";

import React, { useEffect, useState } from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import {
  anularSolicitudAction,
  asignarRemitenteAction,
  cancelarSolicitudAction,
} from "@/src/actions/solicitudes.actions";
import { obtenerRemitentesAprobadosAction } from "@/src/actions/usuarios.actions";

import StatsCards from "@/app/components/dashboard/StatsCards";
import GraficaDona from "@/app/components/dashboard/GraficaDona";
import GraficaLineas from "@/app/components/dashboard/GraficaLineas";
import ActividadReciente from "@/app/components/dashboard/ActividadReciente";
import AccionesYAlertas from "@/app/components/dashboard/AccionesYAlertas";
import TablaSolicitudes from "@/app/components/dashboard/TablaSolicitudes";
import ModalGestionSolicitud from "@/app/components/dashboard/ModalGestionSolicitud";
import { RemitenteOption, SolicitudJSON } from "@/app/components/dashboard/types";

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState<SolicitudJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalSolicitud, setModalSolicitud] = useState<SolicitudJSON | null>(null);
  const [remitentesAprobados, setRemitentesAprobados] = useState<RemitenteOption[]>([]);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/solicitudes");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Error al obtener las solicitudes.");
      }
      setSolicitudes(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    obtenerRemitentesAprobadosAction().then((res) => {
      if (res.success && res.data) setRemitentesAprobados(res.data);
    });
  }, []);

  // Stats derivadas, usadas tanto en alertas como en otros componentes.
  const pendientes = solicitudes.filter(
    (s) => s.estado === EstadoSolicitud.Creada || s.estado === EstadoSolicitud.Asignada,
  ).length;
  const canceladas = solicitudes.filter(
    (s) => s.estado === EstadoSolicitud.Cancelada || s.estado === EstadoSolicitud.Anulada,
  ).length;

  const abrirModal = (sol: SolicitudJSON) => setModalSolicitud(sol);
  const cerrarModal = () => setModalSolicitud(null);

  const handleAsignarRemitente = async (remitenteId: string) => {
    if (!modalSolicitud) return { success: false, error: "No hay solicitud seleccionada." };
    const formData = new FormData();
    formData.append("remitenteId", remitenteId);
    const res = await asignarRemitenteAction(modalSolicitud.id, formData);
    if (res.success) {
      await fetchSolicitudes();
      cerrarModal();
    }
    return res;
  };

  const handleAnular = async () => {
    if (!modalSolicitud) return { success: false, error: "No hay solicitud seleccionada." };
    const formData = new FormData();
    formData.append("motivo", "Anulada por administrador");
    const res = await anularSolicitudAction(modalSolicitud.id, formData);
    if (res.success) {
      await fetchSolicitudes();
      cerrarModal();
    }
    return res;
  };

  const handleCancelar = async (motivo?: string) => {
    if (!modalSolicitud) return { success: false, error: "No hay solicitud seleccionada." };
    const res = await cancelarSolicitudAction(modalSolicitud.id, motivo);
    if (res.success) {
      await fetchSolicitudes();
      cerrarModal();
    }
    return res;
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoSolicitud) => {
    if (!modalSolicitud) return { success: false, error: "No hay solicitud seleccionada." };
    try {
      const res = await fetch(`/api/solicitudes/${modalSolicitud.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "No se pudo actualizar el estado.");
      }
      await fetchSolicitudes();
      cerrarModal();
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido.",
      };
    }
  };

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Panel de control</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Resumen general de la actividad del sistema.
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <StatsCards solicitudes={solicitudes} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#1A1A2E] mb-5">
              Solicitudes por estado
            </h2>
            {loading ? (
              <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />
            ) : (
              <GraficaDona solicitudes={solicitudes} />
            )}
          </div>

          <ActividadReciente solicitudes={solicitudes} loading={loading} />

          <AccionesYAlertas pendientes={pendientes} canceladas={canceladas} />
        </div>

        <TablaSolicitudes
          solicitudes={solicitudes}
          loading={loading}
          error={error}
          onReintentar={fetchSolicitudes}
          onGestionar={abrirModal}
        />

        {!loading && solicitudes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-[#1A1A2E] mb-4">
              Estadísticas del mes
            </h2>
            <GraficaLineas solicitudes={solicitudes} />
          </div>
        )}
      </div>

      {modalSolicitud && (
        <ModalGestionSolicitud
          solicitud={modalSolicitud}
          remitentesAprobados={remitentesAprobados}
          onClose={cerrarModal}
          onAsignarRemitente={handleAsignarRemitente}
          onAnular={handleAnular}
          onCancelar={handleCancelar}
          onCambiarEstado={handleCambiarEstado}
        />
      )}
    </div>
  );
}