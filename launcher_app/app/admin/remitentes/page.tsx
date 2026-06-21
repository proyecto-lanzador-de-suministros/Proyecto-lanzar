"use client";

import React, { useEffect, useState } from "react";
import {
  listarRemitentesAction,
  actualizarBaseRemitenteAction,
} from "@/src/actions/remitentes.actions";
import CoverageMap from "@/app/components/map/CoverageMap";

interface RemitenteBaseJSON {
  id_remitente: string;
  id_base: string;
  nombre: string;
  latitud: number;
  longitud: number;
  capacidad_pista: string;
  estado_cuenta: string;
  configuracionPendiente: boolean;
}

const OPCIONES_CAPACIDAD = ["Pequeña", "Mediana", "Grande"];

export default function AdminRemitentesPage() {
  const [remitentes, setRemitentes] = useState<RemitenteBaseJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState<RemitenteBaseJSON | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formCapacidad, setFormCapacidad] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLon, setFormLon] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    const res = await listarRemitentesAction();
    if (res.success && res.data) {
      setRemitentes(res.data);
    } else {
      setError(res.error ?? "No se pudieron cargar las bases.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirEdicion = (r: RemitenteBaseJSON) => {
    setEditando(r);
    setFormNombre(r.nombre);
    setFormCapacidad(r.capacidad_pista);
    setFormLat(String(r.latitud));
    setFormLon(String(r.longitud));
    setErrorModal(null);
  };

  const cerrarEdicion = () => setEditando(null);

  const handleSeleccionarPunto = (lat: number, lng: number) => {
    setFormLat(lat.toFixed(6));
    setFormLon(lng.toFixed(6));
  };

  const handleGuardar = async () => {
    if (!editando) return;

    const lat = parseFloat(formLat);
    const lon = parseFloat(formLon);

    if (formNombre.trim() === "") {
      setErrorModal("El nombre de la base no puede estar vacío.");
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setErrorModal("Ingresá coordenadas válidas (o seleccioná un punto en el mapa).");
      return;
    }

    setGuardando(true);
    setErrorModal(null);

    const res = await actualizarBaseRemitenteAction(editando.id_remitente, {
      nombre: formNombre.trim(),
      capacidad_pista: formCapacidad,
      latitud: lat,
      longitud: lon,
    });

    if (res.success) {
      await cargar();
      cerrarEdicion();
    } else {
      setErrorModal(res.error ?? "No se pudo guardar la base.");
    }
    setGuardando(false);
  };

  const puntoSeleccionado =
    formLat && formLon && Number.isFinite(parseFloat(formLat)) && Number.isFinite(parseFloat(formLon))
      ? { lat: parseFloat(formLat), lng: parseFloat(formLon) }
      : null;

  return (
    <div className="flex-1 bg-[#F4F6F9] overflow-y-auto">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Gestión de remitentes</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Bases operativas registradas en el sistema. Corregí ubicación y capacidad
          de pista para que el cálculo de asignación de stock funcione correctamente.
        </p>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1A1A2E]">Bases remitentes</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {remitentes.length} base{remitentes.length !== 1 ? "s" : ""} registrada{remitentes.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623]" />
              <span className="text-sm text-[#6B7280]">Cargando bases...</span>
            </div>
          ) : remitentes.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-[#1A1A2E]">No hay bases remitentes registradas.</p>
              <p className="text-xs text-[#6B7280] mt-1">
                Aparecen acá automáticamente cuando se aprueba una cuenta con rol remitente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#6B7280] text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3 font-semibold">Base</th>
                    <th className="px-6 py-3 font-semibold">Cuenta</th>
                    <th className="px-6 py-3 font-semibold">Ubicación</th>
                    <th className="px-6 py-3 font-semibold">Capacidad</th>
                    <th className="px-6 py-3 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {remitentes.map((r) => (
                    <tr key={r.id_remitente} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#1A1A2E]">{r.nombre}</p>
                        <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                          #{r.id_remitente.substring(0, 8)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          r.estado_cuenta === "APROBADA"
                            ? "bg-green-100 text-[#4CAF50]"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.estado_cuenta}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {r.configuracionPendiente ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                            ⚠ Configuración pendiente
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-[#1A1A2E]">
                            {r.latitud.toFixed(4)}, {r.longitud.toFixed(4)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#1A1A2E]">
                        {r.capacidad_pista === "pendiente" ? (
                          <span className="text-[#6B7280] italic">Sin definir</span>
                        ) : (
                          r.capacidad_pista
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => abrirEdicion(r)}
                          className="text-[#1565C0] bg-blue-50 hover:bg-[#1565C0] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) cerrarEdicion();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A2E]">Editar base remitente</h2>
                <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                  #{editando.id_remitente.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={cerrarEdicion}
                className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A1A2E]">Nombre de la base</label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A1A2E]">Capacidad de pista</label>
                <select
                  value={formCapacidad}
                  onChange={(e) => setFormCapacidad(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0] bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {OPCIONES_CAPACIDAD.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                  {formCapacidad && !OPCIONES_CAPACIDAD.includes(formCapacidad) && (
                    <option value={formCapacidad}>{formCapacidad} (actual)</option>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A1A2E]">Latitud</label>
                <input
                  type="number"
                  step="any"
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A1A2E]">Longitud</label>
                <input
                  type="number"
                  step="any"
                  value={formLon}
                  onChange={(e) => setFormLon(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
                />
              </div>
            </div>

            <p className="text-xs text-[#6B7280] mb-2">
              También podés hacer clic en el mapa para fijar la ubicación de la base:
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
              <CoverageMap onSelectPoint={handleSeleccionarPunto} selectedPoint={puntoSeleccionado} />
            </div>

            {errorModal && (
              <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2 mb-4">
                {errorModal}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={cerrarEdicion}
                disabled={guardando}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] transition disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
