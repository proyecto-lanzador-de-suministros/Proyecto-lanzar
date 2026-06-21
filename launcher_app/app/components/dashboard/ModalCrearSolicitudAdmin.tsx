"use client";

import React, { useEffect, useState } from "react";
import { PrioridadSolicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";
import { crearSolicitudAdminAction } from "@/src/actions/solicitudes.actions";
import { obtenerProductosAction } from "@/src/actions/solicitudes.actions";

interface ProductoOption {
  id_producto: string;
  nombre: string;
}

interface UsuarioOption {
  id: string;
  nombre: string;
}

interface Props {
  usuarios: UsuarioOption[];
  onClose: () => void;
  onCreada: () => void;
}

export default function ModalCrearSolicitudAdmin({ usuarios, onClose, onCreada }: Props) {
  const [usuarioId, setUsuarioId] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [prioridad, setPrioridad] = useState<PrioridadSolicitud>(PrioridadSolicitud.Media);
  const [productos, setProductos] = useState<{ productoId: string; cantidad: string }[]>([]);
  const [catalogo, setCatalogo] = useState<ProductoOption[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerProductosAction().then((res) => {
      if (res.success && res.data) setCatalogo(res.data);
    });
  }, []);

  const agregarProducto = () => {
    setProductos([...productos, { productoId: "", cantidad: "1" }]);
  };

  const actualizarProducto = (i: number, campo: "productoId" | "cantidad", valor: string) => {
    const copia = [...productos];
    copia[i] = { ...copia[i], [campo]: valor };
    setProductos(copia);
  };

  const quitarProducto = (i: number) => {
    setProductos(productos.filter((_, idx) => idx !== i));
  };

  const handleCrear = async () => {
    if (!usuarioId) { setError("Seleccioná un usuario solicitante."); return; }
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) { setError("Ingresá coordenadas válidas."); return; }
    if (productos.length === 0 || productos.some((p) => !p.productoId)) { setError("Agregá al menos un producto."); return; }

    setGuardando(true);
    setError(null);

    const res = await crearSolicitudAdminAction({
      id_usuario: usuarioId,
      ubicacion_destino: { type: "Point", coordinates: [lonNum, latNum] },
      prioridad,
      productos: productos.map((p) => ({ productoId: p.productoId, cantidad: parseInt(p.cantidad) || 1 })),
    });

    if (res.success) {
      onCreada();
      onClose();
    } else {
      setError(res.error ?? "Error al crear la solicitud.");
    }
    setGuardando(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A2E]">Nueva solicitud</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Crear solicitud en nombre de un solicitante.</p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1A1A2E]">Solicitante</label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Seleccionar...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1A1A2E]">Latitud destino</label>
              <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)}
                placeholder="-38.0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1A1A2E]">Longitud destino</label>
              <input type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value)}
                placeholder="-62.0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1A1A2E]">Prioridad</label>
            <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as PrioridadSolicitud)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              {Object.values(PrioridadSolicitud).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[#1A1A2E]">Productos</label>
              <button onClick={agregarProducto} className="text-xs text-[#1565C0] font-semibold hover:underline">
                + Agregar
              </button>
            </div>
            {productos.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={p.productoId} onChange={(e) => actualizarProducto(i, "productoId", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Seleccionar...</option>
                  {catalogo.map((prod) => (
                    <option key={prod.id_producto} value={prod.id_producto}>{prod.nombre}</option>
                  ))}
                </select>
                <input type="number" min="1" value={p.cantidad}
                  onChange={(e) => actualizarProducto(i, "cantidad", e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center" />
                <button onClick={() => quitarProducto(i)} className="text-red-500 text-sm font-bold px-2">×</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-[#F44336] bg-red-50 rounded-lg px-3 py-2 mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={guardando}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-[#6B7280] hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleCrear} disabled={guardando}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#1565C0] text-white text-sm font-semibold hover:bg-[#0D47A1] disabled:opacity-50">
            {guardando ? "Creando..." : "Crear solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}
