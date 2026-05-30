import { Link } from "react-router-dom";
import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import api, { getErrorMessage } from "../api/api";

function Login({ onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      onAuth(response.data.data);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-brand">
        <ShieldCheck size={34} />
        <h1>SecureShare</h1>
        <p>Secure document sharing with AI classification and blockchain verification.</p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <h2>Log in</h2>
        {error && <div className="alert error">{error}</div>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button className="primary-button wide" disabled={loading}>
          <LogIn size={18} />
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="form-note">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </section>
  );
}

export default Login;
