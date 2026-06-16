// Modal para gestionar una solicitud puntual: asignar remitente, cambiar estado o anular.
import React, { useState } from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ETIQUETAS_ESTADO, ESTADOS_PERMITIDOS, getPrioridadColor, getStatusColor } from "./constants";
import { RemitenteOption, SolicitudJSON } from "./types";

interface ModalGestionSolicitudProps {
  solicitud: SolicitudJSON;
  remitentesAprobados: RemitenteOption[];
  onClose: () => void;
  onAsignarRemitente: (remitenteId: string) => Promise<{ success: boolean; error?: string }>;
  onAnular: () => Promise<{ success: boolean; error?: string }>;
  onCambiarEstado: (nuevoEstado: EstadoSolicitud) => Promise<{ success: boolean; error?: string }>;
}

export default function ModalGestionSolicitud({
  solicitud,
  remitentesAprobados,
  onClose,
  onAsignarRemitente,
  onAnular,
  onCambiarEstado,
}: ModalGestionSolicitudProps) {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoSolicitud | "">("");
  const [remitenteSeleccionado, setRemitenteSeleccionado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const puedeAsignarRemitente =
    !solicitud.remitenteId &&
    (solicitud.estado === EstadoSolicitud.Creada || solicitud.estado === EstadoSolicitud.Asignada);

  const puedeAnular =
    solicitud.estado !== EstadoSolicitud.Completada &&
    solicitud.estado !== EstadoSolicitud.Anulada &&
    solicitud.estado !== EstadoSolicitud.Cancelada;

  const handleAsignarRemitente = async () => {
    if (!remitenteSeleccionado) return;
    setGuardando(true);
    setErrorModal(null);
    const res = await onAsignarRemitente(remitenteSeleccionado);
    if (!res.success) setErrorModal(res.error ?? "Error al asignar.");
    setGuardando(false);
  };

  const handleAnular = async () => {
    if (!confirm("¿Estás seguro de que deseas anular esta solicitud?")) return;
    setGuardando(true);
    setErrorModal(null);
    const res = await onAnular();
    if (!res.success) setErrorModal(res.error ?? "Error al anular.");
    setGuardando(false);
  };

  const handleGuardarEstado = async () => {
    if (!nuevoEstado) return;
    setGuardando(true);
    setErrorModal(null);
    const res = await onCambiarEstado(nuevoEstado);
    if (!res.success) setErrorModal(res.error ?? "No se pudo actualizar el estado.");
    setGuardando(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Gestionar solicitud</h2>
            <p className="text-xs text-[#6B7280] font-mono mt-0.5">
              #{solicitud.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="bg-[#F4F6F9] rounded-xl p-4 mb-5 space-y-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#6B7280]">Estado actual</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(solicitud.estado)}`}>
              {ETIQUETAS_ESTADO[solicitud.estado]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Prioridad</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPrioridadColor(solicitud.prioridad)}`}>
              {solicitud.prioridad}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Última actualización</span>
            <span className="font-medium text-[#1A1A2E]">
              {new Date(solicitud.fechaActualizacion).toLocaleDateString("es-AR", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Destino</span>
            <span className="font-mono text-xs text-[#1A1A2E]">
              {solicitud.latDestino.toFixed(4)}, {solicitud.lonDestino.toFixed(4)}
            </span>
          </div>
        </div>

        {puedeAsignarRemitente && (
          <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
              Asignar a base remitente:
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white"
                value={remitenteSeleccionado}
                onChange={(e) => setRemitenteSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar base...</option>
                {remitentesAprobados.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <button
                onClick={handleAsignarRemitente}
                disabled={!remitenteSeleccionado || guardando}
                className="px-4 py-2 bg-[#1565C0] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                Asignar
              </button>
            </div>
          </div>
        )}

        <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
          Cambiar estado a:
        </label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] transition mb-4 bg-white"
          value={nuevoEstado}
          onChange={(e) => setNuevoEstado(e.target.value as EstadoSolicitud)}
        >
          <option value="">Seleccionar estado...</option>
          {ESTADOS_PERMITIDOS.filter((e) => e !== solicitud.estado).map((estado) => (
            <option key={estado} value={estado}>{ETIQUETAS_ESTADO[estado]}</option>
          ))}
        </select>

        {errorModal && (
          <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2 mb-4">
            {errorModal}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarEstado}
            disabled={!nuevoEstado || guardando}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Confirmar cambio"}
          </button>
        </div>

        {puedeAnular && (
          <button
            onClick={handleAnular}
            disabled={guardando}
            className="mt-3 w-full px-4 py-2.5 rounded-lg border border-red-200 text-red-600 bg-red-50 text-sm font-semibold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
          >
            Anular solicitud
          </button>
        )}
      </div>
    </div>
  );
}