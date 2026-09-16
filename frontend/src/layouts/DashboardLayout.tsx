import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  FileText,
  User as UserIcon,
  CreditCard,
  LogOut,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scout", label: "AI Scout", icon: Compass },
  { to: "/saved", label: "Saved Ideas", icon: Bookmark },
  { to: "/plans", label: "Business Plans", icon: FileText },
  { to: "/subscription", label: "Subscription", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-950 grid-bg flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-950/80 backdrop-blur-xl px-5 py-6">
        <Link to="/" className="flex items-center gap-2 px-2 mb-8">
          <Radar className="h-6 w-6 text-signal-400" />
          <span className="font-display font-semibold text-lg text-white">
            Business Scout <span className="text-gradient">AI</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === "/admin"
                  ? "bg-white/[0.06] text-white border border-white/10"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="border-t border-white/[0.06] pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-signal-400 to-violet-500 flex items-center justify-center text-ink-950 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.plan} plan</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
