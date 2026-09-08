import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getAllUsers, toggleUserActive } from "../../api/admin";
import AdminLayout from "./Layout";

export default function AdminUsers() {
  const { token, user: me } = useAuth();
  const { show } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(null);

  const load = () => getAllUsers(token).then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, [token]);

  const handleToggle = async (u) => {
    if (u.id === me?.id) { show("You cannot disable your own account.", "error"); return; }
    setToggling(u.id);
    try {
      await toggleUserActive(u.id, token);
      show(`User ${u.disabled ? "enabled" : "disabled"}.`, "success");
      load();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setToggling(null);
    }
  };

  const filtered = !search
    ? users
    : users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Users</h1>
          <p className="admin-sub">{users.length} registered accounts</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-row"><span className="spinner" /> Loading…</div>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ opacity: u.disabled ? 0.5 : 1 }}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="user-avatar-sm">{u.name?.charAt(0)?.toUpperCase()}</span>
                    <strong>{u.name}</strong>
                    {u.id === me?.id && <span className="badge-you">You</span>}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "—"}</td>
                <td>
                  {u.isAdmin
                    ? <span className="role-badge role-admin">Admin</span>
                    : <span className="role-badge role-user">Member</span>
                  }
                </td>
                <td>
                  {u.disabled
                    ? <span className="status-badge" style={{ background: "#feeaea", color: "#b00" }}>Disabled</span>
                    : <span className="status-badge" style={{ background: "#e8f5e9", color: "#1a5c32" }}>Active</span>
                  }
                </td>
                <td>
                  <button
                    className={u.disabled ? "btn-admin-ghost" : "btn-admin-danger"}
                    onClick={() => handleToggle(u)}
                    disabled={toggling === u.id || u.id === me?.id}
                    title={u.id === me?.id ? "Cannot disable your own account" : ""}
                  >
                    {toggling === u.id ? "…" : u.disabled ? "Enable" : "Disable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
