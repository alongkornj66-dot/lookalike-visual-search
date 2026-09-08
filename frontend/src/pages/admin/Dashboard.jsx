import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getStats } from "../../api/admin";
import AdminLayout from "./Layout";

const STATUS_COLOR = { confirmed: "#1a5c32", shipped: "#1a3d8f", delivered: "#555", cancelled: "#b00" };

function StatCard({ label, value, sub, to, accent }) {
  return (
    <Link to={to} className="stat-card" style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <p className="stat-card__val">{value}</p>
      <p className="stat-card__label">{label}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </Link>
  );
}

function stockLabel(n) {
  if (n === 0) return { label: "Out of Stock", cls: "stock-out" };
  if (n <= 5)  return { label: "Low Stock",    cls: "stock-low" };
  return              { label: "In Stock",      cls: "stock-ok"  };
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { getStats(token).then(setStats).catch(() => {}); }, [token]);

  if (!stats) return <AdminLayout><div className="loading-row"><span className="spinner" /> Loading…</div></AdminLayout>;

  const outCount = stats.lowStock?.filter((p) => (p.stock ?? 0) === 0).length ?? 0;

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-sub">Store overview</p>
        </div>
      </div>

      {/* ── Alert banner ── */}
      {stats.lowStock?.length > 0 && (
        <div className="dash-alert">
          <span className="dash-alert__icon">⚠</span>
          <span>
            <strong>{stats.lowStock.length} product{stats.lowStock.length !== 1 ? "s" : ""}</strong> need restocking
            {outCount > 0 && <> — <strong>{outCount} out of stock</strong></>}
          </span>
          <Link to="/admin/products" className="dash-alert__link">View Products →</Link>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        <StatCard label="Total Orders"   value={stats.orders}   sub={`฿${stats.revenue.toLocaleString()} revenue`} to="/admin/orders"   accent="#1a3d8f" />
        <StatCard label="Revenue"        value={`฿${stats.revenue.toLocaleString()}`} to="/admin/orders" accent="#1a5c32" />
        <StatCard label="Members"        value={stats.users}    to="/admin/users"    accent="#555" />
        <StatCard label="Products"       value={stats.products} sub={`${stats.totalStock ?? 0} units in stock`} to="/admin/products" accent={outCount > 0 ? "#b00" : "#0a0a0a"} />
      </div>

      {/* ── Orders by status ── */}
      {Object.keys(stats.byStatus).length > 0 && (
        <div className="admin-section">
          <h2 className="admin-section-title">Orders by Status</h2>
          <div className="status-pills">
            {Object.entries(stats.byStatus).map(([s, n]) => (
              <div key={s} className="status-pill-card">
                <span className="status-dot" style={{ background: STATUS_COLOR[s] || "#aaa" }} />
                <span className="status-pill-label" style={{ textTransform: "capitalize" }}>{s}</span>
                <span className="status-pill-num">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
        {/* ── Recent Orders ── */}
        <div>
          <div className="admin-section-head">
            <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Recent Orders</h2>
            <Link to="/admin/orders" className="admin-link">View all →</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="admin-empty">No orders yet.</p>
          ) : (
            <table className="admin-table" style={{ marginTop: 12 }}>
              <thead>
                <tr><th>Customer</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div><strong>{o.userName || "—"}</strong></div>
                      <div style={{ fontSize: 11, color: "var(--grey-400)" }}>{new Date(o.createdAt).toLocaleDateString("en-GB")}</div>
                    </td>
                    <td><strong>฿{o.total?.toLocaleString()}</strong></td>
                    <td><span className="status-badge" style={{ background: STATUS_COLOR[o.status] + "22", color: STATUS_COLOR[o.status] }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Low Stock Alert ── */}
        <div>
          <div className="admin-section-head">
            <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Stock Alerts</h2>
            <Link to="/admin/products" className="admin-link">Manage →</Link>
          </div>
          {!stats.lowStock || stats.lowStock.length === 0 ? (
            <div className="stock-all-good">
              <span className="stock-check">✓</span> All products are well stocked
            </div>
          ) : (
            <table className="admin-table" style={{ marginTop: 12 }}>
              <thead>
                <tr><th>Product</th><th>Stock</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.lowStock.map((p) => {
                  const { label, cls } = stockLabel(p.stock ?? 0);
                  return (
                    <tr key={p.id}>
                      <td style={{ maxWidth: 160 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--grey-400)", textTransform: "capitalize" }}>{p.category}</div>
                      </td>
                      <td><span className={`stock-qty ${cls}`}>{p.stock ?? 0}</span></td>
                      <td><span className={`stock-status-badge ${cls}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
