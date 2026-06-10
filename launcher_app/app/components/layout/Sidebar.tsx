import Logo from "@/app/components/ui/Logo";

const navItems = [
  { label: "Inicio", href: "/", badge: 0 },
  { label: "Mis solicitudes", href: "/solicitudes", badge: 0 },
  { label: "Solicitudes asignadas", href: "/asignadas", badge: 3 },
  { label: "Historial", href: "/historial", badge: 0 },
  { label: "Mi stock", href: "/stock", badge: 0 },
  { label: "Notificaciones", href: "/notificaciones", badge: 2 },
  { label: "Perfil", href: "/perfil", badge: 0 },
  { label: "Ayuda", href: "/ayuda", badge: 0 },
];

interface SidebarProps {
  activeHref?: string;
}

export default function Sidebar({ activeHref = "/" }: SidebarProps) {
  return (
    <aside
      style={{
        backgroundColor: "var(--color-surface-dark)",
        width: 220,
        minHeight: "100vh",
      }}
      className="flex flex-col gap-2 p-3"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-6">
        <Logo className="w-9 h-9 shrink-0" />
        <span className="text-xl font-bold tracking-tight">
          <span className="text-white">Aero</span>
          <span style={{ color: "var(--color-brand)" }}>Envíos</span>
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <a
              key={item.href}
              href={item.href}
              style={
                isActive ? { backgroundColor: "var(--color-interactive)" } : {}
              }
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm no-underline transition-colors
                ${
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
            >
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span
                  style={{ backgroundColor: "var(--color-brand)" }}
                  className="text-white text-[11px] font-semibold min-w-5 h-5 rounded-full flex items-center justify-center px-1"
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bloque de ayuda */}
      <div className="bg-white/10 rounded-xl p-4 flex flex-col items-center gap-1.5 text-center mt-2">
        <p className="text-white text-[13px] font-semibold m-0">
          ¿Necesitás ayuda?
        </p>
        <p className="text-white/55 text-xs m-0 leading-snug">
          Nuestro equipo está para ayudarte.
        </p>
        <button className="mt-2 w-full py-2 px-3 rounded-lg border border-white/30 bg-transparent text-white text-[13px] cursor-pointer hover:bg-white/10 transition-colors">
          Contactar soporte
        </button>
      </div>
    </aside>
  );
}
