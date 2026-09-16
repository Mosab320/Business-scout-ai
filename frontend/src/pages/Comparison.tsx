import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import { getOpportunity } from "../services/api";
import type { Opportunity } from "../types";

const COLORS = ["#2dd4bf", "#a78bfa", "#f472b6", "#fbbf24", "#60a5fa"];

export default function Comparison() {
  const location = useLocation();
  const navigate = useNavigate();
  const opportunityIds: string[] = (location.state as any)?.opportunityIds ?? [];
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (opportunityIds.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(opportunityIds.map((id) => getOpportunity(id)))
      .then(setOpportunities)
      .finally(() => setLoading(false));
  }, [opportunityIds.join(",")]);

  const chartData = opportunities.map((o) => ({
    name: o.title.length > 18 ? o.title.slice(0, 16) + "…" : o.title,
    Score: o.score,
    Difficulty:
      o.difficulty === "easy" ? 90 : o.difficulty === "medium" ? 65 : 40,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-display text-2xl font-semibold text-white mb-1">Compare Opportunities</h1>
        <p className="text-sm text-slate-400 mb-8">
          Side-by-side view of your selected business ideas.
        </p>

        {loading ? (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        ) : opportunities.length < 2 ? (
          <div className="glass-card p-10 text-center text-slate-400">
            Select 2-5 opportunities from your results to compare them here.
            <div className="mt-4">
              <button onClick={() => navigate("/scout")} className="btn-primary text-sm py-2.5 inline-flex">
                Back to Scout
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="glass-card p-6 mb-8">
              <h2 className="font-display font-semibold text-white mb-4">AI Score vs Ease of Execution</h2>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1424",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Score" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Difficulty" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-500">
                    <th className="px-5 py-3 font-medium">Business</th>
                    <th className="px-5 py-3 font-medium">Startup Cost</th>
                    <th className="px-5 py-3 font-medium">Demand</th>
                    <th className="px-5 py-3 font-medium">Competition</th>
                    <th className="px-5 py-3 font-medium">Difficulty</th>
                    <th className="px-5 py-3 font-medium">AI Score</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((o, i) => (
                    <tr key={o.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-5 py-3 text-slate-200 flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        {o.title}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        PKR {o.startup_cost.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-slate-400 capitalize">{o.demand}</td>
                      <td className="px-5 py-3 text-slate-400 capitalize">{o.competition}</td>
                      <td className="px-5 py-3 text-slate-400 capitalize">{o.difficulty}</td>
                      <td className="px-5 py-3 text-signal-300 font-medium">{o.score}/100</td>
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
