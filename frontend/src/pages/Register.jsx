import { Link } from "react-router-dom";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import api, { getErrorMessage } from "../api/api";

function Register({ onAuth }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });
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
      const response = await api.post("/auth/register", form);
      onAuth(response.data.data);
    } catch (apiError) {
      setError(getErrorMessage(apiError, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-brand">
        <h1>Create account</h1>
        <p>Register as a document owner or a verifier for the demo workflow.</p>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        {error && <div className="alert error">{error}</div>}
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
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
            minLength={6}
            required
          />
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="USER">USER</option>
            <option value="VERIFIER">VERIFIER</option>
          </select>
        </label>
        <button className="primary-button wide" disabled={loading}>
          <UserPlus size={18} />
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="form-note">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

export default Register;
