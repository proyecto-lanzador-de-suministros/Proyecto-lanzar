// Modal para gestionar una solicitud puntual: asignar remitente, avanzar estado, cancelar o anular.
import React, { useState } from "react";
import { EstadoSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { ETIQUETAS_ESTADO, TRANSICION_SIGUIENTE, getPrioridadColor, getStatusColor } from "./constants";
import { RemitenteOption, SolicitudJSON } from "./types";

interface ModalGestionSolicitudProps {
  solicitud: SolicitudJSON;
  remitentesAprobados: RemitenteOption[];
  onClose: () => void;
  onAsignarRemitente: (remitenteId: string) => Promise<{ success: boolean; error?: string }>;
  onAnular: () => Promise<{ success: boolean; error?: string }>;
  onCancelar: (motivo?: string) => Promise<{ success: boolean; error?: string }>;
  onAvanzarEstado: () => Promise<{ success: boolean; error?: string }>;
}

// Estados desde los que el admin puede cancelar (CU-10): estados tempranos.
const ESTADOS_CANCELABLES = new Set([EstadoSolicitud.Creada, EstadoSolicitud.Asignada]);

export default function ModalGestionSolicitud({
  solicitud,
  remitentesAprobados,
  onClose,
  onAsignarRemitente,
  onAnular,
  onCancelar,
  onAvanzarEstado,
}: ModalGestionSolicitudProps) {
  const [remitenteSeleccionado, setRemitenteSeleccionado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Estado del flujo de cancelación (CU-10, paso 2: motivo opcional)
  const [mostrandoCancelacion, setMostrandoCancelacion] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const puedeAsignarRemitente =
    !solicitud.remitenteId &&
    (solicitud.estado === EstadoSolicitud.Creada || solicitud.estado === EstadoSolicitud.Asignada);

  const puedeAnular =
    solicitud.estado !== EstadoSolicitud.Completada &&
    solicitud.estado !== EstadoSolicitud.Anulada &&
    solicitud.estado !== EstadoSolicitud.Cancelada;

  const puedeCancelar = ESTADOS_CANCELABLES.has(solicitud.estado);

  // Transición de avance disponible para el estado actual (CU-12 a CU-16).
  // Si todavía no tiene remitente asignado, primero hay que asignarlo:
  // no se ofrece "avanzar" para no saltear ese paso.
  const siguienteTransicion = TRANSICION_SIGUIENTE[solicitud.estado];
  const puedeAvanzarEstado = !!siguienteTransicion && !puedeAsignarRemitente;

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

  const handleAbrirCancelacion = () => {
    setErrorModal(null);
    setMostrandoCancelacion(true);
  };

  const handleConfirmarCancelacion = async () => {
    setGuardando(true);
    setErrorModal(null);
    const res = await onCancelar(motivoCancelacion.trim() || undefined);
    if (!res.success) {
      setErrorModal(res.error ?? "Error al cancelar la solicitud.");
    } else {
      setMostrandoCancelacion(false);
      setMotivoCancelacion("");
    }
    setGuardando(false);
  };

  const handleAvanzarEstado = async () => {
    setGuardando(true);
    setErrorModal(null);
    const res = await onAvanzarEstado();
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

        {/* Flujo de cancelación (CU-10): se abre inline, no es un modal anidado */}
        {mostrandoCancelacion ? (
          <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
            <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
              Motivo de cancelación (opcional):
            </label>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Ej: el solicitante pidió cancelar por error en el destino..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 bg-white mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMostrandoCancelacion(false);
                  setMotivoCancelacion("");
                }}
                disabled={guardando}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmarCancelacion}
                disabled={guardando}
                className="flex-1 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50"
              >
                {guardando ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {puedeAvanzarEstado && siguienteTransicion ? (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-2">
                  Siguiente paso del flujo
                </label>
                <button
                  onClick={handleAvanzarEstado}
                  disabled={guardando}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? "Procesando..." : siguienteTransicion.label}
                </button>
              </div>
            ) : siguienteTransicion && puedeAsignarRemitente ? (
              <p className="text-xs text-[#6B7280] bg-gray-50 rounded-lg px-3 py-2.5 mb-5">
                Asigná una base remitente antes de continuar con el flujo de preparación y envío.
              </p>
            ) : (
              <p className="text-sm text-[#6B7280] mb-5">
                Esta solicitud no tiene una transición de avance disponible.
              </p>
            )}

            {errorModal && (
              <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2 mb-4">
                {errorModal}
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition"
            >
              Cerrar
            </button>

            <div className="flex gap-2 mt-3">
              {puedeCancelar && (
                <button
                  onClick={handleAbrirCancelacion}
                  disabled={guardando}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 text-sm font-semibold hover:bg-amber-500 hover:text-white transition disabled:opacity-50"
                >
                  Cancelar solicitud
                </button>
              )}
              {puedeAnular && (
                <button
                  onClick={handleAnular}
                  disabled={guardando}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 bg-red-50 text-sm font-semibold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                >
                  Anular solicitud
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}