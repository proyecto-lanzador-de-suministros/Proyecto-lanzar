"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "¿Cómo realizo una nueva solicitud de suministro?",
    answer: "Para solicitar suministros, ve a la página de Inicio (dashboard), haz clic en un punto del mapa que represente el destino del envío y luego pulsa en el botón 'Crear solicitud'. Se abrirá un panel donde podrás configurar la prioridad y los productos a enviar.",
  },
  {
    question: "¿Qué significan los diferentes estados de mi solicitud?",
    answer: "Los estados reflejan el ciclo logístico:\n- Creada: Tu solicitud fue enviada.\n- Asignada: Se determinó stock y se asignó una base aérea.\n- En preparación: Se están empaquetando tus suministros.\n- Lista: El paquete está listo para el vuelo.\n- En camino: El avión/drone está en ruta de entrega.\n- Lanzada: El paquete fue soltado en paracaídas sobre las coordenadas.\n- Entregada: Confirmaste la recepción física del paquete.",
  },
  {
    question: "¿Puedo cancelar una solicitud ya enviada?",
    answer: "Sí, puedes cancelar tu solicitud desde la página 'Mis solicitudes' siempre y cuando se encuentre en estado 'Creada' o 'Asignada'. Una vez que pasa a 'En preparación', el proceso no se puede detener debido a la asignación de recursos logísticos físicos.",
  },
  {
    question: "¿Qué ocurre si no hay stock de los productos que solicito?",
    answer: "El sistema verifica el stock automáticamente tras la creación. Si ninguna de nuestras bases de lanzamiento cuenta con el stock solicitado, la solicitud pasará automáticamente al estado 'Rechazada' y se te notificará el motivo y los productos faltantes.",
  },
  {
    question: "¿Cuáles son las condiciones de envío?",
    answer: "Los envíos se realizan por caída libre con paracaídas desde una aeronave. El sistema calcula automáticamente la trayectoria de lanzamiento considerando el peso de la carga y las condiciones climáticas del momento; si el viento supera el límite operativo de seguridad, el envío se reprograma hasta que las condiciones mejoren. Por este motivo, los tiempos de entrega pueden variar según la disponibilidad de la base asignada y el clima en la zona de destino.",
  },
];

function AyudaContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q");
  const [openIndex, setOpenIndex] = useState<number | null>(
    initialQ !== null ? parseInt(initialQ, 10) : null
  );

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-8 font-sans max-w-4xl">

      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ayuda y Soporte</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Preguntas frecuentes sobre el funcionamiento del sistema.
        </p>
      </div>

      {/* Preguntas Frecuentes (Acordeón) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Preguntas Frecuentes</h2>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left p-4 font-semibold text-xs text-slate-700 dark:text-slate-300 flex justify-between items-center hover:bg-slate-50/55 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <span className="text-slate-400 transform transition-transform duration-200">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-4 border-t border-slate-50 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default function AyudaPage() {
  return (
    <Suspense fallback={null}>
      <AyudaContent />
    </Suspense>
  );
}