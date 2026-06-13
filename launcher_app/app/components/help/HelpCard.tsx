// app/components/dashboard/HelpCard.tsx
export default function HelpCard() {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col items-center text-center gap-3">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        ¿Necesitás ayuda?
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Contactá a soporte ante cualquier duda.
      </p>
      <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Contactar soporte
      </button>
    </section>
  );
}
