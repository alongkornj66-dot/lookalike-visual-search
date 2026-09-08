import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register, loading } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      const user = await register(form.name, form.email, form.password);
      show(`Account created. Welcome, ${user.name}!`, "success");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">LOOKALIKE</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join us to save items and track your orders.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label" htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="field-input"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="field-input"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="field-input"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="auth-visual">
        <img src="http://localhost:4000/images/tshirt_001.jpg" alt="" />
        <img src="http://localhost:4000/images/hat_020.jpg" alt="" />
        <img src="http://localhost:4000/images/bag_017.jpg" alt="" />
      </div>
    </div>
  );
}
