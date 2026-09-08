import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { imageUrl } from "../api/client";

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconMinus() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

function IconPlus() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className={`drawer-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? "open" : ""}`}>
        <div className="cart-drawer__head">
          <h2 className="cart-drawer__title">
            Your Bag {totalItems > 0 && <span className="cart-drawer__count">{totalItems}</span>}
          </h2>
          <button className="icon-btn" onClick={onClose}><IconClose /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your bag is empty.</p>
            <button className="cta-btn" onClick={onClose}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="cart-item">
                  <Link to={`/product/${item.id}`} onClick={onClose}>
                    <img
                      className="cart-item__img"
                      src={imageUrl(item.imageUrl)}
                      alt={item.name}
                    />
                  </Link>
                  <div className="cart-item__info">
                    <p className="cart-item__cat">{item.category}</p>
                    <p className="cart-item__name">{item.name}</p>
                    {item.size && <p className="cart-item__size">Size: {item.size}</p>}
                    <p className="cart-item__price">฿{(item.price * item.qty).toLocaleString()}</p>
                    <div className="cart-item__qty">
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.qty - 1)} disabled={item.qty <= 1}><IconMinus /></button>
                      <span>{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.qty + 1)}><IconPlus /></button>
                      <button className="cart-item__remove" onClick={() => removeItem(item.id, item.size)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__foot">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="cart-summary-row cart-summary-row--muted">
                <span>Shipping</span>
                <span>{totalPrice >= 2000 ? "Free" : "฿150"}</span>
              </div>
              <div className="cart-summary-row cart-summary-row--total">
                <span>Total</span>
                <span>฿{(totalPrice + (totalPrice >= 2000 ? 0 : 150)).toLocaleString()}</span>
              </div>
              <button className="cta-btn" style={{ marginTop: 16 }}>Checkout</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
