import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radar, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { friendlyError } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err, "Couldn't log you in. Check your email and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 grid-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Radar className="h-6 w-6 text-signal-400" />
          <span className="font-display font-semibold text-lg text-white">
            Business Scout <span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="font-display text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-6">Log in to continue your business research.</p>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-5 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-60">
              {loading ? "Logging in…" : "Log in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-signal-300 hover:text-signal-200">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
