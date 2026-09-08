import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrders } from "../../api/user";
import AccountLayout from "./Layout";

const STATUS_COLOR = { confirmed: "#1a5c32", shipped: "#0a3d8f", delivered: "#555", cancelled: "#b00" };

export default function AccountOverview() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders(token).then(setOrders).catch(() => {});
  }, [token]);

  const recentOrders = orders.slice(0, 3);

  return (
    <AccountLayout>
      <h1 className="account-title">Welcome back, {user.name}</h1>

      <div className="overview-grid">
        <Link to="/account/orders" className="overview-card">
          <p className="overview-card__num">{orders.length}</p>
          <p className="overview-card__label">Orders</p>
        </Link>
        <Link to="/wishlist" className="overview-card">
          <p className="overview-card__num">—</p>
          <p className="overview-card__label">Saved Items</p>
        </Link>
        <Link to="/account/addresses" className="overview-card">
          <p className="overview-card__num">—</p>
          <p className="overview-card__label">Addresses</p>
        </Link>
      </div>

      {recentOrders.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="account-section-head">
            <h2 className="account-subtitle">Recent Orders</h2>
            <Link to="/account/orders" className="account-link">View all</Link>
          </div>
          {recentOrders.map((o) => (
            <div key={o.id} className="order-row">
              <div>
                <p className="order-id">{o.id}</p>
                <p className="order-date">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[o.status] || "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {o.status}
              </p>
              <p className="order-total">฿{o.total.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
