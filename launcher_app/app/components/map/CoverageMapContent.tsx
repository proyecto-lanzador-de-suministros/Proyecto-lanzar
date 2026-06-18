"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CoverageMapContentProps {
  onSelectPoint?: (lat: number, lng: number) => void;
  selectedPoint?: { lat: number; lng: number } | null;
}

export default function CoverageMapContent({
  onSelectPoint,
  selectedPoint,
}: CoverageMapContentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const defaultCenter: [number, number] = [-38.7183, -62.2663]; // Bahía Blanca

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear el mapa con drag y zoom activado
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    // TileLayer con OpenStreetMap (API externa gratuita)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Intentar geolocalización del dispositivo
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc: [number, number] = [latitude, longitude];
          if (mapRef.current) {
            mapRef.current.setView(userLoc, 13);
          }
        },
        () => {
          // Si deniega o falla, centrar en Bahía Blanca
          if (mapRef.current) {
            mapRef.current.setView(defaultCenter, 13);
          }
        }
      );
    }

    // Evento de clic para seleccionar punto
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onSelectPoint) {
        onSelectPoint(lat, lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar el marcador cuando cambia la selección
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedPoint) {
      const pos: [number, number] = [selectedPoint.lat, selectedPoint.lng];

      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        const customIcon = L.divIcon({
          html: `<div class="w-8 h-8 flex items-center justify-center bg-brand rounded-full border-2 border-white shadow-lg text-white font-bold text-base">📍</div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        markerRef.current = L.marker(pos, { icon: customIcon }).addTo(mapRef.current);
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [selectedPoint]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={{ minHeight: "380px" }}
    />
  );
}
