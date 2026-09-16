import { useEffect, useState } from "react";
import { Users, Compass, TrendingUp, DollarSign } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api, friendlyError } from "../services/api";

interface AdminOverview {
  total_users: number;
  active_users: number;
  total_scouting_sessions: number;
  popular_business_categories: { category: string; count: number }[];
  free_users: number;
  pro_users: number;
  revenue_overview: { estimated_monthly_revenue_pkr: number; note: string };
  recent_users: { id: string; name: string; email: string; plan: string; created_at: string }[];
}

export default function Admin() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AdminOverview>("/api/admin/overview")
      .then((res) => setData(res.data))
      .catch((err) => setError(friendlyError(err, "Couldn't load admin data.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-display text-2xl font-semibold text-white mb-1">Admin Overview</h1>
        <p className="text-sm text-slate-400 mb-8">Platform-wide usage and revenue snapshot.</p>

        {loading && (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        )}
        {error && <p className="text-red-300 text-sm">{error}</p>}

        {data && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Stat icon={Users} label="Total Users" value={data.total_users} />
              <Stat icon={Compass} label="Scouting Sessions" value={data.total_scouting_sessions} />
              <Stat icon={TrendingUp} label="Pro Users" value={data.pro_users} />
              <Stat
                icon={DollarSign}
                label="Est. Monthly Revenue"
                value={`PKR ${data.revenue_overview.estimated_monthly_revenue_pkr.toLocaleString()}`}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-white mb-4">Popular Categories</h2>
                <div className="space-y-3">
                  {data.popular_business_categories.map((c) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 capitalize">{c.category.replace(/_/g, " ")}</span>
                      <span className="text-slate-200 font-medium">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-white mb-4">Free vs Pro</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                      <div
                        className="h-full bg-signal-400"
                        style={{
                          width: `${(data.pro_users / Math.max(data.total_users, 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-slate-400">Free: {data.free_users}</span>
                  <span className="text-signal-300">Pro: {data.pro_users}</span>
                </div>
              </div>
            </div>

            <div className="glass-card mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_users.map((u) => (
                    <tr key={u.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-5 py-3 text-slate-200">{u.name}</td>
                      <td className="px-5 py-3 text-slate-400">{u.email}</td>
                      <td className="px-5 py-3 text-slate-400 capitalize">{u.plan}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-display text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
