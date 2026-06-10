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
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Logo className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">
          <span className="sidebar-logo-aero">Aero</span>
          <span className="sidebar-logo-envios">Envíos</span>
        </span>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`}
            >
              <span className="sidebar-nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bloque de ayuda */}
      <div className="sidebar-help">
        <p className="sidebar-help-title">¿Necesitás ayuda?</p>
        <p className="sidebar-help-subtitle">
          Nuestro equipo está para ayudarte.
        </p>
        <button className="sidebar-help-btn">Contactar soporte</button>
      </div>

      <style>{`
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--color-surface-dark);
          display: flex;
          flex-direction: column;
          padding: 24px 12px;
          gap: 8px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px 24px;
        }

        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .sidebar-logo-aero   { color: #ffffff; }
        .sidebar-logo-envios { color: var(--color-brand); }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.65);
          font-size: 14px;
          transition: background 0.15s, color 0.15s;
        }

        .sidebar-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .sidebar-nav-item--active {
          background: var(--color-interactive);
          color: #ffffff;
        }

        .sidebar-nav-label { flex: 1; }

        .sidebar-nav-badge {
          background: var(--color-brand);
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }

        .sidebar-help {
          background: rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          margin-top: 8px;
        }

        .sidebar-help-title {
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .sidebar-help-subtitle {
          color: rgba(255, 255, 255, 0.55);
          font-size: 12px;
          margin: 0;
          line-height: 1.4;
        }

        .sidebar-help-btn {
          margin-top: 8px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          color: #ffffff;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .sidebar-help-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </aside>
  );
}
