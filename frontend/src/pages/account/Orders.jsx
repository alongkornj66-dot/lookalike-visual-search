import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrders } from "../../api/user";
import { imageUrl } from "../../api/client";
import AccountLayout from "./Layout";

const STATUS_LABEL = { confirmed: "Confirmed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const STATUS_COLOR = { confirmed: "#1a5c32", shipped: "#0a3d8f", delivered: "#555", cancelled: "#b00" };

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(token).then(setOrders).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <AccountLayout><div className="loading-row"><span className="spinner" /> Loading…</div></AccountLayout>;

  return (
    <AccountLayout>
      <h1 className="account-title">My Orders</h1>
      <p className="account-desc">{orders.length} {orders.length === 1 ? "order" : "orders"} placed</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You have not placed any orders yet.</p>
          <Link to="/" className="acc-btn" style={{ marginTop: 16, display: "inline-block" }}>Start shopping</Link>
        </div>
      ) : (
        <div style={{ marginTop: 24 }}>
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-card__head">
                <div>
                  <p className="order-id">{o.id}</p>
                  <p className="order-date">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[o.status], textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {STATUS_LABEL[o.status]}
                  </p>
                  <p className="order-total">฿{o.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="order-items">
                {o.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="order-item">
                    <img src={imageUrl(item.imageUrl)} alt={item.name} className="order-item__img" />
                    <div className="order-item__info">
                      <p className="order-item__name">{item.name}</p>
                      <p className="order-item__meta">Size: {item.size} &middot; Qty: {item.qty}</p>
                      <p className="order-item__price">฿{(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card__foot">
                <div>
                  <p style={{ fontSize: 11, color: "var(--grey-400)", marginBottom: 2 }}>Delivered to</p>
                  <p style={{ fontSize: 12 }}>{o.shippingAddress.recipient} · {o.shippingAddress.address}, {o.shippingAddress.city}</p>
                </div>
                <div style={{ textAlign: "right", fontSize: 12 }}>
                  <p style={{ color: "var(--grey-400)", marginBottom: 2 }}>Total</p>
                  <p style={{ fontWeight: 700 }}>฿{o.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
