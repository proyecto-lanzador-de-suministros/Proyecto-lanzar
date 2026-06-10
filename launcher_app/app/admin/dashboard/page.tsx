"use client";

import { useEffect, useState } from "react";
import type { Solicitud } from "@/src/modules/solicitudes/domain/entities/Solicitud";

export default function AdminDashboard() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const url = filtroEstado
          ? `/api/admin/solicitudes?estado=${filtroEstado}`
          : "/api/admin/solicitudes";
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(
            "Error al obtener las solicitudes. Verifica tu conexión o sesión.",
          );
        }

        const data = await res.json();
        setSolicitudes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [filtroEstado]);

  const getStatusColor = (estado: Solicitud["estado"]) => {
    switch (estado) {
      case "creada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "asignada":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "en_preparacion":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "lista":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_camino":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "lanzada":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "completada":
        return "bg-green-100 text-green-800 border-green-200";
      case "rechazada":
      case "cancelada":
      case "anulada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">
              Panel de Control
            </h1>
            <p className="text-[#64748b] mt-1 text-sm md:text-base">
              Gestión general de solicitudes de suministros
            </p>
          </div>

          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center">
            <span className="text-gray-500 pl-2 text-sm font-medium mr-2">
              Filtrar:
            </span>
            <select
              className="bg-transparent text-sm text-[#f97316] font-semibold outline-none cursor-pointer pr-4"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="creada">Creada</option>
              <option value="asignada">Asignada</option>
              <option value="en_preparacion">En preparación</option>
              <option value="lista">Listo</option>
              <option value="en_camino">En Camino</option>
              <option value="lanzada">Lanzada</option>
              <option value="completada">Completada</option>
              <option value="rechazada">Rechazada</option>
              <option value="cancelada">Cancelada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f97316]"></div>
              <span className="ml-4 text-gray-500 font-medium">
                Cargando datos...
              </span>
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-500 bg-red-50 font-medium">
              {error}
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <p className="text-lg font-medium text-gray-700">
                No hay solicitudes para mostrar
              </p>
              <p className="text-sm mt-1">
                Intenta cambiando el filtro de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#475569] text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-5 font-semibold">ID Pedido</th>
                    <th className="p-5 font-semibold">Fecha / Hora</th>
                    <th className="p-5 font-semibold">Destino (Lat, Lon)</th>
                    <th className="p-5 font-semibold">Solicitante</th>
                    <th className="p-5 font-semibold">Estado</th>
                    <th className="p-5 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {solicitudes.map((solicitud) => (
                    <tr
                      key={solicitud.id_solicitud}
                      className="hover:bg-[#fff7f0] transition-colors group"
                    >
                      <td className="p-5 font-mono text-xs text-gray-500">
                        #{solicitud.id_solicitud.substring(0, 8)}
                      </td>
                      <td className="p-5 text-gray-700 font-medium">
                        {new Date(solicitud.fecha_solicitada).toLocaleDateString(
                          "es-AR",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td className="p-5 text-gray-600">
                        {solicitud.ubicacion_destino.coordinates[1].toFixed(4)},{" "}
                        {solicitud.ubicacion_destino.coordinates[0].toFixed(4)}
                      </td>
                      <td className="p-5 text-gray-600">
                        {solicitud.id_usuario.substring(0, 8)}...
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(solicitud.estado)}`}
                        >
                          {solicitud.estado}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button className="text-[#f97316] bg-orange-50 hover:bg-[#ea580c] hover:text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm opacity-0 group-hover:opacity-100">
                          Gestionar
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
    </div>
  );
}
