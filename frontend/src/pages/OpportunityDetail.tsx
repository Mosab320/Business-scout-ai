import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bookmark, BookmarkCheck, FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getOpportunity,
  saveOpportunity,
  unsaveOpportunity,
  generateBusinessPlan,
  friendlyError,
} from "../services/api";
import type { Opportunity } from "../types";

const SCORE_LABELS: Record<string, string> = {
  market_demand: "Market Demand",
  competition: "Competition",
  budget_fit: "Budget Fit",
  skill_fit: "Skill Fit",
  scalability: "Scalability",
  execution_difficulty: "Ease of Execution",
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getOpportunity(id)
      .then(setOpp)
      .catch((err) => setError(friendlyError(err, "Couldn't load this opportunity.")))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleSave() {
    if (!opp) return;
    if (opp.saved) {
      await unsaveOpportunity(opp.id);
    } else {
      await saveOpportunity(opp.id);
    }
    setOpp({ ...opp, saved: !opp.saved });
  }

  async function handleGeneratePlan() {
    if (!opp) return;
    setGenerating(true);
    setError(null);
    try {
      const plan = await generateBusinessPlan(opp.id);
      navigate(`/plans/${plan.id}`);
    } catch (err) {
      setError(friendlyError(err, "Couldn't generate a business plan right now."));
    } finally {
      setGenerating(false);
    }
  }

  const chartData = opp
    ? Object.entries(opp.score_breakdown).map(([key, value]) => ({
        name: SCORE_LABELS[key] ?? key,
        value,
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {loading && (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {opp && (
          <>
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl font-semibold text-white mb-2">{opp.title}</h1>
                <p className="text-slate-400 max-w-xl leading-relaxed">{opp.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={toggleSave} className="btn-secondary text-sm py-2.5">
                  {opp.saved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-signal-400" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  className="btn-primary text-sm py-2.5 disabled:opacity-60"
                >
                  <FileText className="h-4 w-4" />
                  {generating ? "Generating…" : "Generate Business Plan"}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <SummaryStat label="AI Score" value={`${opp.score}/100`} />
              <SummaryStat label="Startup Cost" value={`PKR ${opp.startup_cost.toLocaleString()}`} />
              <SummaryStat label="Est. Margin" value={opp.estimated_margin} />
            </div>

            <div className="glass-card p-6 mb-6">
              <h2 className="font-display font-semibold text-white mb-4">Score Breakdown</h2>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={130} stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1424",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="value" fill="#2dd4bf" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 mb-6">
              <h2 className="font-display font-semibold text-white mb-2">Why this opportunity</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{opp.reasoning}</p>
            </div>

            {opp.market_gaps?.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <h2 className="font-display font-semibold text-white mb-3">Market Gaps</h2>
                <ul className="space-y-2">
                  {opp.market_gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <span className="text-signal-400">•</span> {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {opp.risks?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-white mb-3">Risks to consider</h2>
                <ul className="space-y-2">
                  {opp.risks.map((risk, i) => (
                    <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-display text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
