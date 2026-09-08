import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const LINKS = [
  { to: "/account",           label: "Overview",        end: true },
  { to: "/account/orders",    label: "My Orders"              },
  { to: "/account/profile",   label: "Personal Details"       },
  { to: "/account/addresses", label: "Address Book"           },
  { to: "/account/password",  label: "Change Password"        },
  { to: "/wishlist",          label: "Saved Items"            },
];

export default function AccountLayout({ children }) {
  const { isLoggedIn, user, logout } = useAuth();
  const { show } = useToast();

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  return (
    <div className="account-page">
      <aside className="account-sidebar">
        <div className="account-sidebar__head">
          <div className="account-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="account-username">{user.name}</p>
            <p className="account-email">{user.email}</p>
          </div>
        </div>
        <nav className="account-nav">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `account-nav__item ${isActive ? "active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
          <button
            className="account-nav__item account-nav__item--red"
            onClick={() => { logout(); show("Signed out", "default"); }}
          >
            Sign out
          </button>
        </nav>
      </aside>
      <div className="account-content">{children}</div>
    </div>
  );
}
