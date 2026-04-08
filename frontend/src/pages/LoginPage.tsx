import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { FormEvent, ChangeEvent } from "react";
import { api } from "../lib/api";
import { useTask } from "../context/TaskContext";

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, fetchProjects } = useTask();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api("login", { email, password });

      if (!data.success) {
        setError((data.message as string) || "Invalid credentials.");
        return;
      }

      const user = data.user as { id: string; name: string; email: string };
      localStorage.setItem("userId",    user.id);
      localStorage.setItem("userName",  user.name);
      localStorage.setItem("userEmail", user.email);

      // Sync context immediately — auth guard checks context, not just localStorage
      setUser(user);
      fetchProjects(user.id, user.email);

      navigate("/dashboard");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">TaskMaster</div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Enter your credentials to continue.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="field-input"
            placeholder="you@example.com"
            required
            autoFocus
          />

          <label className="field-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
            required
          />

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          No account?{" "}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}