import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getAddresses, addAddress, placeOrder } from "../api/user";
import { imageUrl } from "../api/client";

const EMPTY_ADDR = { name: "Home", recipient: "", phone: "", address: "", city: "", postalCode: "", isDefault: true };

export default function Checkout() {
  const { isLoggedIn, token } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState(EMPTY_ADDR);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  if (items.length === 0) return <Navigate to="/" replace />;

  useEffect(() => {
    getAddresses(token)
      .then((data) => {
        setAddresses(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def) setSelectedAddr(def);
        else setShowNewAddr(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const shipping = totalPrice >= 2000 ? 0 : 150;
  const total = totalPrice + shipping;

  const f = (k) => (e) => setNewAddrForm((p) => ({ ...p, [k]: e.target.value }));

  const handlePlace = async () => {
    if (!selectedAddr && !showNewAddr) { show("Please select a delivery address", "default"); return; }
    setPlacing(true);
    try {
      let addr = selectedAddr;
      if (showNewAddr) {
        addr = await addAddress(newAddrForm, token);
        setAddresses((prev) => [...prev, addr]);
      }
      const order = await placeOrder({ items, shippingAddress: addr, note }, token);
      clearCart();
      show("Order placed successfully!", "success");
      navigate(`/account/orders`);
    } catch (err) {
      show(err.message, "default");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="loading-row" style={{ padding: "60px 32px" }}><span className="spinner" /> Loading…</div>;

  return (
    <div className="checkout-page">
      <div className="checkout-left">
        <h1 className="checkout-title">Checkout</h1>

        {/* Delivery address */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">Delivery Address</h2>
          {addresses.length > 0 && (
            <div className="address-grid" style={{ marginBottom: 16 }}>
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  className={`address-card address-card--select ${selectedAddr?.id === addr.id && !showNewAddr ? "address-card--default" : ""}`}
                  onClick={() => { setSelectedAddr(addr); setShowNewAddr(false); }}
                >
                  {addr.isDefault && <span className="address-tag">Default</span>}
                  <p className="address-name">{addr.name}</p>
                  <p className="address-line">{addr.recipient}</p>
                  <p className="address-line">{addr.address}, {addr.city} {addr.postalCode}</p>
                </button>
              ))}
            </div>
          )}
          <button className="acc-btn acc-btn--outline" onClick={() => { setShowNewAddr((v) => !v); setSelectedAddr(null); }}>
            {showNewAddr ? "Cancel" : "+ Use a different address"}
          </button>

          {showNewAddr && (
            <div className="account-form" style={{ marginTop: 20 }}>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Recipient name *</label>
                  <input className="field-input" value={newAddrForm.recipient} onChange={f("recipient")} required />
                </div>
                <div className="field">
                  <label className="field-label">Phone</label>
                  <input className="field-input" value={newAddrForm.phone} onChange={f("phone")} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Address *</label>
                <input className="field-input" value={newAddrForm.address} onChange={f("address")} required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">City *</label>
                  <input className="field-input" value={newAddrForm.city} onChange={f("city")} required />
                </div>
                <div className="field">
                  <label className="field-label">Postal code</label>
                  <input className="field-input" value={newAddrForm.postalCode} onChange={f("postalCode")} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Note */}
        <section className="checkout-section">
          <h2 className="checkout-section-title">Order Note <span style={{ fontWeight: 400, color: "var(--grey-400)" }}>(optional)</span></h2>
          <textarea className="field-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special instructions?" style={{ resize: "vertical" }} />
        </section>
      </div>

      {/* Order summary */}
      <div className="checkout-right">
        <h2 className="checkout-section-title">Order Summary</h2>
        <div className="checkout-items">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="checkout-item">
              <img src={imageUrl(item.imageUrl)} alt={item.name} className="checkout-item__img" />
              <div>
                <p className="checkout-item__name">{item.name}</p>
                <p className="checkout-item__meta">Size: {item.size} &middot; Qty: {item.qty}</p>
              </div>
              <p className="checkout-item__price">฿{(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="checkout-totals">
          <div className="cart-summary-row"><span>Subtotal</span><span>฿{totalPrice.toLocaleString()}</span></div>
          <div className="cart-summary-row cart-summary-row--muted"><span>Shipping</span><span>{shipping === 0 ? "Free" : `฿${shipping}`}</span></div>
          <div className="cart-summary-row cart-summary-row--total"><span>Total</span><span>฿{total.toLocaleString()}</span></div>
        </div>
        <button className="cta-btn" onClick={handlePlace} disabled={placing} style={{ marginTop: 20 }}>
          {placing ? "Placing order…" : "Place Order"}
        </button>
        <p style={{ fontSize: 11, color: "var(--grey-400)", textAlign: "center", marginTop: 12 }}>
          By placing your order you agree to our terms and conditions.
        </p>
      </div>
    </div>
  );
}
