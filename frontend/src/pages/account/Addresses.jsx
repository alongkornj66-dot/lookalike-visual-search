import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../../api/user";
import AccountLayout from "./Layout";

const EMPTY = { name: "Home", recipient: "", phone: "", address: "", city: "", postalCode: "", isDefault: false };

export default function Addresses() {
  const { token } = useAuth();
  const { show } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | address object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => getAddresses(token).then(setAddresses).finally(() => setLoading(false));
  useEffect(() => { load(); }, [token]);

  const openNew = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (addr) => { setForm(addr); setEditing(addr); };
  const cancel = () => { setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === "new") {
        await addAddress(form, token);
        show("Address added", "success");
      } else {
        await updateAddress(editing.id, form, token);
        show("Address updated", "success");
      }
      await load();
      setEditing(null);
    } catch (err) {
      show(err.message, "default");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id, token);
    show("Address removed", "default");
    load();
  };

  const handleSetDefault = async (addr) => {
    await updateAddress(addr.id, { ...addr, isDefault: true }, token);
    load();
  };

  const f = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  if (loading) return <AccountLayout><div className="loading-row"><span className="spinner" /> Loading…</div></AccountLayout>;

  return (
    <AccountLayout>
      <div className="account-section-head">
        <h1 className="account-title" style={{ marginBottom: 0 }}>Address Book</h1>
        {!editing && <button className="acc-btn" onClick={openNew}>+ Add new address</button>}
      </div>
      <p className="account-desc">Manage your delivery addresses.</p>

      {editing ? (
        <form onSubmit={handleSubmit} className="account-form">
          <h2 className="account-subtitle">{editing === "new" ? "New Address" : "Edit Address"}</h2>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Label (e.g. Home, Office)</label>
              <input className="field-input" value={form.name} onChange={f("name")} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Recipient name *</label>
              <input className="field-input" value={form.recipient} onChange={f("recipient")} required />
            </div>
            <div className="field">
              <label className="field-label">Phone number</label>
              <input className="field-input" value={form.phone} onChange={f("phone")} placeholder="081-234-5678" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Address *</label>
            <input className="field-input" value={form.address} onChange={f("address")} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">City *</label>
              <input className="field-input" value={form.city} onChange={f("city")} required />
            </div>
            <div className="field">
              <label className="field-label">Postal code</label>
              <input className="field-input" value={form.postalCode} onChange={f("postalCode")} />
            </div>
          </div>
          <label className="field-checkbox">
            <input type="checkbox" checked={form.isDefault} onChange={f("isDefault")} />
            Set as default address
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="auth-submit" type="submit" disabled={saving} style={{ maxWidth: 180 }}>
              {saving ? "Saving…" : "Save address"}
            </button>
            <button type="button" className="acc-btn acc-btn--outline" onClick={cancel}>Cancel</button>
          </div>
        </form>
      ) : addresses.length === 0 ? (
        <div className="empty-state">
          <p>No addresses saved yet.</p>
          <button className="acc-btn" style={{ marginTop: 16 }} onClick={openNew}>Add your first address</button>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className={`address-card ${addr.isDefault ? "address-card--default" : ""}`}>
              {addr.isDefault && <span className="address-tag">Default</span>}
              <p className="address-name">{addr.name}</p>
              <p className="address-line">{addr.recipient}</p>
              {addr.phone && <p className="address-line">{addr.phone}</p>}
              <p className="address-line">{addr.address}</p>
              <p className="address-line">{addr.city} {addr.postalCode}</p>
              <div className="address-actions">
                <button className="address-act" onClick={() => openEdit(addr)}>Edit</button>
                {!addr.isDefault && <button className="address-act" onClick={() => handleSetDefault(addr)}>Set default</button>}
                <button className="address-act address-act--red" onClick={() => handleDelete(addr.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
