import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login, loading } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      show(`Welcome back, ${user.name}`, "success");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">LOOKALIKE</div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Welcome back. Enter your details below.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
              <a href="#" className="field-forgot">Forgot password?</a>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="field-input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </div>

      <div className="auth-visual">
        <img src="http://localhost:4000/images/dress_007.jpg" alt="" />
        <img src="http://localhost:4000/images/bag_015.jpg" alt="" />
        <img src="http://localhost:4000/images/shoe_012.jpg" alt="" />
      </div>
    </div>
  );
}
