import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getProfile, updateProfile } from "../../api/user";
import AccountLayout from "./Layout";

export default function Profile() {
  const { token } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProfile(token)
      .then((data) => { setForm({ name: data.name, phone: data.phone || "" }); setEmail(data.email); })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form, token);
      show("Profile updated successfully", "success");
    } catch (err) {
      show(err.message, "default");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AccountLayout><div className="loading-row"><span className="spinner" /> Loading…</div></AccountLayout>;

  return (
    <AccountLayout>
      <h1 className="account-title">Personal Details</h1>
      <p className="account-desc">Update your name and contact information.</p>

      <form onSubmit={handleSubmit} className="account-form">
        <div className="field">
          <label className="field-label" htmlFor="name">Full name</label>
          <input id="name" className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="email">Email address</label>
          <input id="email" className="field-input" value={email} disabled style={{ opacity: 0.5 }} />
          <p style={{ fontSize: 11, color: "var(--grey-400)", marginTop: 4 }}>Email cannot be changed at this time.</p>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="phone">Phone number</label>
          <input id="phone" className="field-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. 081-234-5678" />
        </div>
        <button className="auth-submit" type="submit" disabled={saving} style={{ maxWidth: 200 }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </AccountLayout>
  );
}
