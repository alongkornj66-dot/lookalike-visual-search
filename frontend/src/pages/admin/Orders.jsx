import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getAllOrders, updateOrderStatus } from "../../api/admin";
import AdminLayout from "./Layout";

const STATUSES = ["confirmed", "shipped", "delivered", "cancelled"];
const STATUS_COLOR = { confirmed: "#1a5c32", shipped: "#1a3d8f", delivered: "#555", cancelled: "#b00" };

export default function AdminOrders() {
  const { token } = useAuth();
  const { show } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const load = () => getAllOrders(token).then(setOrders).finally(() => setLoading(false));
  useEffect(() => { load(); }, [token]);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status, token);
    show(`Order updated to ${status}`, "success");
    load();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <h1 className="admin-title">Orders</h1>
        <p className="admin-sub">{orders.length} total orders</p>
      </div>

      <div className="admin-filter-bar">
        {["all", ...STATUSES].map((s) => (
          <button key={s} className={`admin-filter-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="admin-filter-count">{s === "all" ? orders.length : orders.filter((o) => o.status === s).length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-row"><span className="spinner" /> Loading…</div>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">No orders found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <>
                <tr key={o.id} className={expanded === o.id ? "row-expanded" : ""}>
                  <td>
                    <button className="admin-link" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                      <span className="mono">{o.id}</span>
                    </button>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString("en-GB")}</td>
                  <td>{o.userName || "—"}<br /><span style={{ fontSize: 11, color: "var(--grey-400)" }}>{o.shippingAddress?.city}</span></td>
                  <td>{o.items?.length} item{o.items?.length !== 1 ? "s" : ""}</td>
                  <td><strong>฿{o.total?.toLocaleString()}</strong></td>
                  <td><span className="status-badge" style={{ background: STATUS_COLOR[o.status] + "22", color: STATUS_COLOR[o.status] }}>{o.status}</span></td>
                  <td>
                    <select
                      className="admin-select"
                      value={o.status}
                      onChange={(e) => handleStatus(o.id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr key={`${o.id}-detail`} className="row-detail">
                    <td colSpan={7}>
                      <div className="order-detail-panel">
                        <div>
                          <p className="order-detail-head">Items</p>
                          {o.items?.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="order-detail-item">
                              <span>{item.name}</span>
                              <span>Size: {item.size}</span>
                              <span>x{item.qty}</span>
                              <span>฿{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="order-detail-head">Delivery</p>
                          <p>{o.shippingAddress?.recipient}</p>
                          <p>{o.shippingAddress?.address}</p>
                          <p>{o.shippingAddress?.city} {o.shippingAddress?.postalCode}</p>
                          {o.note && <p style={{ marginTop: 8, color: "var(--grey-600)" }}>Note: {o.note}</p>}
                        </div>
                        <div>
                          <p className="order-detail-head">Summary</p>
                          <p>Subtotal: ฿{o.subtotal?.toLocaleString()}</p>
                          <p>Shipping: {o.shipping === 0 ? "Free" : `฿${o.shipping}`}</p>
                          <p><strong>Total: ฿{o.total?.toLocaleString()}</strong></p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
