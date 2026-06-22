"use client";

import React, { useEffect, useState } from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import {
  anularSolicitudAction,
  asignarRemitenteAction,
  cancelarSolicitudAction,
  registrarEnPreparacionAction,
  registrarListaAction,
  registrarEnCaminoAction,
  registrarLanzadaAction,
  confirmarRecibidaAction,
  listarSolicitudesAdminAction,
} from "@/src/actions/solicitudes.actions";
import {
  obtenerRemitentesAprobadosAction,
  obtenerSolicitantesAction,
} from "@/src/actions/usuarios.actions";

import StatsCards from "@/app/components/dashboard/StatsCards";
import GraficaDona from "@/app/components/dashboard/GraficaDona";
import GraficaLineas from "@/app/components/dashboard/GraficaLineas";
import ActividadReciente from "@/app/components/dashboard/ActividadReciente";
import AccionesYAlertas from "@/app/components/dashboard/AccionesYAlertas";
import TablaSolicitudes from "@/app/components/dashboard/TablaSolicitudes";
import ModalGestionSolicitud from "@/app/components/dashboard/ModalGestionSolicitud";
import ModalCrearSolicitudAdmin from "@/app/components/dashboard/ModalCrearSolicitudAdmin";
import {
  RemitenteOption,
  SolicitudJSON,
} from "@/app/components/dashboard/types";

export default function AdminDashboard() {
  console.log("[AdminDashboard] Componente montado");

  const [solicitudes, setSolicitudes] = useState<SolicitudJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalSolicitud, setModalSolicitud] = useState<SolicitudJSON | null>(
    null,
  );
  const [remitentesAprobados, setRemitentesAprobados] = useState<
    RemitenteOption[]
  >([]);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [solicitantes, setSolicitantes] = useState<
    { id: string; nombre: string }[]
  >([]);

  const fetchSolicitudes = async () => {
    console.log("[AdminDashboard] fetchSolicitudes iniciando...");
    setLoading(true);
    setError(null);
    try {
      const res = await listarSolicitudesAdminAction();
      console.log("[AdminDashboard] fetchSolicitudes response:", res);
      if (res.success && res.data) {
        console.log("[AdminDashboard] Solicitudes cargadas:", res.data.length);
        setSolicitudes(
          res.data.map((s) => ({
            ...s,
            latDestino: Number(s.latDestino),
            lonDestino: Number(s.lonDestino),
          })),
        );
      } else {
        throw new Error(res.error ?? "Error al obtener las solicitudes.");
      }
    } catch (err: unknown) {
      console.error("[AdminDashboard] fetchSolicitudes error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      console.log("[AdminDashboard] fetchSolicitudes finalizado");
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchSolicitudes();
      obtenerRemitentesAprobadosAction().then((res) => {
        console.log(
          "[AdminDashboard] obtenerRemitentesAprobadosAction response:",
          res,
        );
        if (res.success && res.data) setRemitentesAprobados(res.data);
      });
      obtenerSolicitantesAction().then((res) => {
        console.log(
          "[AdminDashboard] obtenerSolicitantesAction response:",
          res,
        );
        if (res.success && res.data) setSolicitantes(res.data);
      });
    });
  }, []);

  // Stats derivadas, usadas tanto en alertas como en otros componentes.
  const pendientes = solicitudes.filter(
    (s) =>
      s.estado === EstadoSolicitud.Creada ||
      s.estado === EstadoSolicitud.Asignada,
  ).length;
  const canceladas = solicitudes.filter(
    (s) =>
      s.estado === EstadoSolicitud.Cancelada ||
      s.estado === EstadoSolicitud.Anulada,
  ).length;

  const abrirModal = (sol: SolicitudJSON) => setModalSolicitud(sol);
  const cerrarModal = () => setModalSolicitud(null);

  const handleAsignarRemitente = async (remitenteId: string) => {
    if (!modalSolicitud)
      return { success: false, error: "No hay solicitud seleccionada." };
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
    if (!modalSolicitud)
      return { success: false, error: "No hay solicitud seleccionada." };
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
    if (!modalSolicitud)
      return { success: false, error: "No hay solicitud seleccionada." };
    const res = await cancelarSolicitudAction(modalSolicitud.id, motivo);
    if (res.success) {
      await fetchSolicitudes();
      cerrarModal();
    }
    return res;
  };

  /**
   * Avanza la solicitud al siguiente estado del flujo (CU-12 a CU-16),
   * delegando en el caso de uso específico según el estado actual.
   * A diferencia del viejo PATCH genérico, cada uno de estos casos de uso
   * registra el cambio en el historial de auditoría y notifica al
   * solicitante (o remitente, en CU-16) automáticamente.
   */
  const handleAvanzarEstado = async (cantidad_cajas?: number) => {
    if (!modalSolicitud)
      return { success: false, error: "No hay solicitud seleccionada." };

    const accionesPorEstado: Partial<
      Record<
        EstadoSolicitud,
        () => Promise<{ success: boolean; error?: string }>
      >
    > = {
      [EstadoSolicitud.Asignada]: () =>
        registrarEnPreparacionAction(modalSolicitud.id),
      [EstadoSolicitud.EnPreparacion]: () =>
        registrarListaAction(modalSolicitud.id, cantidad_cajas!),
      [EstadoSolicitud.Lista]: () => registrarEnCaminoAction(modalSolicitud.id),
      [EstadoSolicitud.EnCamino]: () =>
        registrarLanzadaAction(modalSolicitud.id),
      [EstadoSolicitud.Lanzada]: () =>
        confirmarRecibidaAction(modalSolicitud.id),
    };

    const ejecutarAccion = accionesPorEstado[modalSolicitud.estado];

    if (!ejecutarAccion) {
      return {
        success: false,
        error: "No hay una transición disponible para el estado actual.",
      };
    }

    const res = await ejecutarAccion();
    if (res.success) {
      await fetchSolicitudes();
      cerrarModal();
    }
    return res;
  };

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">
            Panel de control
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Resumen general de la actividad del sistema.
          </p>
        </div>
        <button
          onClick={() => setMostrarCrear(true)}
          className="bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0D47A1] transition flex items-center gap-2"
        >
          + Nueva solicitud
        </button>
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
          onAvanzarEstado={handleAvanzarEstado}
        />
      )}

      {mostrarCrear && (
        <ModalCrearSolicitudAdmin
          usuarios={solicitantes}
          onClose={() => setMostrarCrear(false)}
          onCreada={fetchSolicitudes}
        />
      )}
    </div>
  );
}
