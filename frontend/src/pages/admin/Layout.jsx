import { NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const LINKS = [
  { to: "/admin",          label: "Dashboard", end: true, icon: "▣" },
  { to: "/admin/orders",   label: "Orders",    icon: "◫" },
  { to: "/admin/products", label: "Products",  icon: "◈" },
  { to: "/admin/users",    label: "Users",     icon: "◉" },
];

export default function AdminLayout({ children }) {
  const { user, isLoggedIn, logout } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>LOOKALIKE</span>
          <span className="admin-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav__item ${isActive ? "active" : ""}`}
            >
              <span className="admin-nav__icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__foot">
          <NavLink to="/" className="admin-nav__item">
            <span className="admin-nav__icon">←</span> Back to Store
          </NavLink>
          <button
            className="admin-nav__item"
            onClick={() => { logout(); show("Signed out", "default"); navigate("/"); }}
          >
            <span className="admin-nav__icon">⏻</span> Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div />
          <div className="admin-topbar__user">
            <span className="admin-avatar">{user.name.charAt(0)}</span>
            <span>{user.name}</span>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
