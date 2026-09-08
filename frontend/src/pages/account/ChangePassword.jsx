import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { changePassword } from "../../api/user";
import AccountLayout from "./Layout";

export default function ChangePassword() {
  const { token } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) { setError("New passwords do not match."); return; }
    if (form.newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      await changePassword({ current: form.current, newPassword: form.newPassword }, token);
      show("Password changed successfully", "success");
      setForm({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout>
      <h1 className="account-title">Change Password</h1>
      <p className="account-desc">Choose a strong password at least 6 characters long.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="account-form">
        <div className="field">
          <label className="field-label">Current password</label>
          <input type="password" className="field-input" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} required />
        </div>
        <div className="field">
          <label className="field-label">New password</label>
          <input type="password" className="field-input" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="At least 6 characters" required />
        </div>
        <div className="field">
          <label className="field-label">Confirm new password</label>
          <input type="password" className="field-input" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} required />
        </div>
        <button className="auth-submit" type="submit" disabled={saving} style={{ maxWidth: 200 }}>
          {saving ? "Saving…" : "Update password"}
        </button>
      </form>
    </AccountLayout>
  );
}
