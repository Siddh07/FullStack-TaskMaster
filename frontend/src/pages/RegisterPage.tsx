import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function RegisterPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api("register", { name, email, password });

      if (!data.success) {
        setError((data.message as string) || "Registration failed.");
        return;
      }

      navigate("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">TaskMaster</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Get started — it takes 30 seconds.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label" htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="field-input"
            placeholder="Jane Smith"
            required
            autoFocus
          />

          <label className="field-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="field-input"
            placeholder="you@example.com"
            required
          />

          <label className="field-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
            required
            minLength={6}
          />

          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
