import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "register") await register(form);
      else await login({ email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const registerMode = mode === "register";

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo">S</div>
        <h1>ShopSphere</h1>
        <p className="muted">A simple full-stack online store.</p>

        <div className="auth-switch">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={registerMode ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <form onSubmit={submit} className="form-stack">
          {registerMode && (
            <label>Name<input required value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} /></label>
          )}
          <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} /></label>
          <label>Password<input required minLength="6" type="password" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} /></label>

          {error && <div className="error">{error}</div>}
          <button className="primary" disabled={busy}>{busy ? "Please wait..." : registerMode ? "Create Account" : "Sign In"}</button>
        </form>
      </div>
    </main>
  );
}
