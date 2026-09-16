import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl font-semibold text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  );
}
