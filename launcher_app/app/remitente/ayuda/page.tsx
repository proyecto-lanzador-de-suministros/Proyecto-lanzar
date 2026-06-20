"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "¿Cómo gestiono las solicitudes asignadas a mi base?",
    answer: "Desde la sección 'Solicitudes' podés ver todas las solicitudes asignadas a tu base. Usá los filtros para encontrar las pendientes y haz clic en una para ver el detalle y avanzar su estado (En preparación → Lista → En camino → Lanzada).",
  },
  {
    question: "¿Cómo actualizo el stock de mi base?",
    answer: "En la sección 'Mi stock' podés seleccionar tu base y ver el inventario actual. Podés fijar valores absolutos o sumar/restar unidades usando los botones + y −.",
  },
  {
    question: "¿Qué hago si no tengo suficiente stock para una solicitud?",
    answer: "Si no contás con el stock necesario, la solicitud se rechazará automáticamente. Te recomendamos mantener el inventario actualizado para evitar asignaciones que no puedas cumplir.",
  },
  {
    question: "¿Cómo sé cuándo tengo una nueva solicitud asignada?",
    answer: "Las notificaciones aparecen en el panel principal y en la campanita de la barra superior. También podés revisar el historial completo en la sección 'Notificaciones'.",
  },
];

export default function RemitenteAyudaPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      alert("Por favor, completa todos los campos del formulario.");
      return;
    }
    setFormSent(true);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-8 font-sans max-w-4xl">

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ayuda y Soporte</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Preguntas frecuentes y canal directo para contactar al equipo de soporte técnico.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Contactar Soporte</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-snug">
            ¿Tenés algún inconveniente técnico o duda sobre tus operaciones? Enviános un mensaje y te responderemos a la brevedad.
          </p>

          {formSent ? (
            <div className="bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 p-4 rounded-xl text-xs flex flex-col items-center gap-2">
              <span className="text-xl">✉️</span>
              <strong className="font-semibold">¡Mensaje enviado con éxito!</strong>
              <p className="text-center text-[11px] text-green-600 dark:text-green-400 leading-snug mt-1">
                Hemos recibido tu reporte. Un agente de soporte se contactará con vos.
              </p>
              <button
                onClick={() => setFormSent(false)}
                className="mt-2 text-brand font-semibold hover:underline cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 text-xs">

              <div>
                <label className="text-slate-400 dark:text-slate-500 block font-semibold mb-1">Asunto:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Error al actualizar stock"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-slate-400 dark:text-slate-500 block font-semibold mb-1">Mensaje:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detallá tu consulta o inconveniente aquí..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                className="bg-brand text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg shadow-orange-500/10 hover:bg-orange-600 transition-colors text-xs cursor-pointer"
              >
                Enviar mensaje
              </button>

            </form>
          )}
        </div>

      </div>

    </div>
  );
}
