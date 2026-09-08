import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getAdminProducts, createProduct, updateProduct, deleteProduct, receiveStock } from "../../api/admin";
import AdminLayout from "./Layout";

const CATEGORIES = ["clothing", "shoes", "bags", "accessories"];
const CAT_MAP = { clothing: ["tshirt", "dress"], shoes: ["shoe"], bags: ["bag"], accessories: ["hat"] };
const EMPTY = { name: "", price: "", category: "tshirt", imageUrl: "", description: "", stock: "" };

function stockLabel(n) {
  if (n === 0) return { label: "Out of Stock", cls: "stock-out" };
  if (n <= 5)  return { label: "Low Stock",    cls: "stock-low" };
  return              { label: "In Stock",      cls: "stock-ok"  };
}

export default function AdminProducts() {
  const { token } = useAuth();
  const { show } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [modal, setModal]       = useState(null);   // null | "add" | product (edit)
  const [receiveModal, setReceiveModal] = useState(null); // null | product
  const [form, setForm]         = useState(EMPTY);
  const [receiveQty, setReceiveQty] = useState("");
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const inputRef = useRef(null);
  const qtyRef   = useRef(null);

  const load = () => getAdminProducts(token).then(setProducts).finally(() => setLoading(false));
  useEffect(() => { load(); }, [token]);
  useEffect(() => { if (modal) setTimeout(() => inputRef.current?.focus(), 60); }, [modal]);
  useEffect(() => { if (receiveModal) setTimeout(() => qtyRef.current?.focus(), 60); }, [receiveModal]);

  const openAdd  = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price), stock: String(p.stock ?? 0) }); setModal(p); };
  const closeModal = () => { setModal(null); setSaving(false); };
  const openReceive  = (p) => { setReceiveQty(""); setReceiveModal(p); };
  const closeReceive = () => { setReceiveModal(null); setSaving(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.imageUrl) { show("Name, price and image URL are required.", "error"); return; }
    setSaving(true);
    try {
      const body = { ...form, price: parseFloat(form.price), stock: form.stock !== "" ? parseInt(form.stock) : 0 };
      if (modal === "add") { await createProduct(body, token); show("Product created.", "success"); }
      else { await updateProduct(modal.id, body, token); show("Product updated.", "success"); }
      closeModal(); load();
    } catch (err) { show(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    try { await deleteProduct(id, token); show("Product deleted.", "success"); load(); }
    catch (err) { show(err.message, "error"); }
    finally { setDeleting(null); }
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    const qty = parseInt(receiveQty);
    if (!qty || qty < 1) { show("Enter a valid quantity.", "error"); return; }
    setSaving(true);
    try {
      await receiveStock(receiveModal.id, qty, token);
      show(`+${qty} units received for "${receiveModal.name}"`, "success");
      closeReceive(); load();
    } catch (err) { show(err.message, "error"); }
    finally { setSaving(false); }
  };

  const catMatches = (p, cat) => {
    if (cat === "all") return true;
    return (CAT_MAP[cat] || [cat]).includes(p.category);
  };

  const stockMatches = (p, filter) => {
    const s = p.stock ?? 0;
    if (filter === "out")  return s === 0;
    if (filter === "low")  return s > 0 && s <= 5;
    if (filter === "ok")   return s > 5;
    return true;
  };

  const filtered = products.filter((p) =>
    catMatches(p, catFilter) &&
    stockMatches(p, stockFilter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const outCount = products.filter((p) => (p.stock ?? 0) === 0).length;
  const lowCount = products.filter((p) => { const s = p.stock ?? 0; return s > 0 && s <= 5; }).length;

  return (
    <AdminLayout>
      {/* ── Page head ── */}
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Products</h1>
          <p className="admin-sub">
            {products.length} total
            {outCount > 0 && <span className="head-alert"> · {outCount} out of stock</span>}
            {lowCount > 0 && <span className="head-warn">  · {lowCount} low stock</span>}
          </p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {/* ── Filters ── */}
      <div className="admin-toolbar">
        <input className="admin-search-input" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["all", "clothing", "shoes", "bags", "accessories"].map((c) => (
            <button key={c} className={`admin-filter-btn ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","All"],["out","Out of Stock"],["low","Low Stock"],["ok","In Stock"]].map(([v, label]) => (
            <button key={v} className={`admin-filter-btn ${stockFilter === v ? "active" : ""}`} onClick={() => setStockFilter(v)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="loading-row"><span className="spinner" /> Loading…</div>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">No products found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const { label, cls } = stockLabel(p.stock ?? 0);
              return (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="admin-product-thumb"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/56/72`; }}
                    />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    {p.description && <p style={{ fontSize: 11, color: "var(--grey-400)", marginTop: 2 }}>{p.description.slice(0, 55)}{p.description.length > 55 ? "…" : ""}</p>}
                    {p.lastRestocked && <p style={{ fontSize: 10, color: "var(--grey-400)", marginTop: 2 }}>Last restocked: {new Date(p.lastRestocked).toLocaleDateString("en-GB")}</p>}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                  <td>฿{Number(p.price).toLocaleString()}</td>
                  <td>
                    <span className={`stock-qty ${cls}`}>{p.stock ?? 0}</span>
                  </td>
                  <td>
                    <span className={`stock-status-badge ${cls}`}>{label}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn-receive" onClick={() => openReceive(p)}>Receive</button>
                      <button className="btn-admin-ghost" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn-admin-danger" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                        {deleting === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ── Receive Stock Modal ── */}
      {receiveModal && (
        <div className="admin-modal-overlay" onClick={closeReceive}>
          <div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="receive-modal-head">
              <img
                src={receiveModal.imageUrl}
                alt={receiveModal.name}
                className="receive-modal-thumb"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${receiveModal.id}/64/80`; }}
              />
              <div>
                <h2 className="admin-modal-title" style={{ marginBottom: 4 }}>Receive Stock</h2>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{receiveModal.name}</p>
                <p style={{ fontSize: 12, color: "var(--grey-400)" }}>
                  Current stock: <strong style={{ color: "var(--black)" }}>{receiveModal.stock ?? 0} units</strong>
                </p>
              </div>
            </div>
            <form onSubmit={handleReceive} className="admin-form" style={{ marginTop: 20 }}>
              <div className="admin-form-row">
                <label>Quantity Received *</label>
                <input
                  ref={qtyRef}
                  className="admin-input admin-input--lg"
                  type="number"
                  min={1}
                  placeholder="Enter quantity (e.g. 50)"
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  required
                />
              </div>
              {receiveQty && parseInt(receiveQty) > 0 && (
                <div className="receive-preview">
                  <span>{receiveModal.stock ?? 0}</span>
                  <span className="receive-arrow">→</span>
                  <span className="receive-new">{(receiveModal.stock ?? 0) + parseInt(receiveQty)} units</span>
                </div>
              )}
              <div className="admin-modal-foot">
                <button type="button" className="btn-admin-ghost" onClick={closeReceive}>Cancel</button>
                <button type="submit" className="btn-receive-confirm" disabled={saving}>
                  {saving ? "Saving…" : "Confirm Receive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add / Edit Product Modal ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">{modal === "add" ? "Add Product" : "Edit Product"}</h2>
            <form className="admin-form" onSubmit={handleSave}>
              <div className="admin-form-row">
                <label>Name *</label>
                <input ref={inputRef} className="admin-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="admin-form-row-2col">
                <div className="admin-form-row">
                  <label>Price (฿) *</label>
                  <input className="admin-input" type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className="admin-form-row">
                  <label>Stock</label>
                  <input className="admin-input" type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-row">
                <label>Category</label>
                <select className="admin-input admin-select-full" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="tshirt">Clothing — T-Shirt</option>
                  <option value="dress">Clothing — Dress</option>
                  <option value="shoe">Shoe</option>
                  <option value="bag">Bag</option>
                  <option value="hat">Hat / Accessories</option>
                </select>
              </div>
              <div className="admin-form-row">
                <label>Image URL *</label>
                <input className="admin-input" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} required />
              </div>
              {form.imageUrl && (
                <div className="admin-image-preview-wrap">
                  <img src={form.imageUrl} alt="preview" className="admin-image-preview" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              )}
              <div className="admin-form-row">
                <label>Description</label>
                <textarea className="admin-input admin-textarea" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="admin-modal-foot">
                <button type="button" className="btn-admin-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>{saving ? "Saving…" : modal === "add" ? "Create" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
