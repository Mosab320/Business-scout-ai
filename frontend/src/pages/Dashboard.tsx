import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Bookmark,
  FileText,
  Zap,
  ArrowRight,
  Sparkles,
  Gauge,
  Rocket,
  Scale,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import OpportunityCard from "../components/OpportunityCard";
import { getDashboard, saveOpportunity, unsaveOpportunity } from "../services/api";
import type { DashboardData } from "../types";
import { useAuth } from "../context/AuthContext";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Multi-Agent Research",
    desc: "Seven specialized AI agents research demand, competitors, and costs for every idea — automatically.",
  },
  {
    icon: Gauge,
    title: "Transparent Scoring",
    desc: "Every opportunity gets a 0–100 score with the full breakdown shown, never a black box.",
  },
  {
    icon: Rocket,
    title: "Full Business Plans",
    desc: "Generate a complete plan and 30-day launch roadmap for any idea, ready to act on.",
  },
  {
    icon: Scale,
    title: "Compare Side by Side",
    desc: "Shortlist ideas and compare their costs, demand, and scores in one view.",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleSave(oppId: string, saved: boolean) {
    if (!data) return;
    if (saved) {
      await unsaveOpportunity(oppId);
    } else {
      await saveOpportunity(oppId);
    }
    setData({
      ...data,
      latest_recommendations: data.latest_recommendations.map((o) =>
        o.id === oppId ? { ...o, saved: !saved } : o
      ),
    });
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Here's where your business research stands.</p>
          </div>
          <Link to="/scout" className="btn-primary text-sm py-2.5">
            New AI Scout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        ) : data ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard icon={Compass} label="Scouting Sessions" value={data.total_scouting_sessions} />
              <StatCard icon={Bookmark} label="Saved Opportunities" value={data.saved_opportunities_count} />
              <StatCard icon={FileText} label="Business Plans" value={data.business_plans_count} />
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-medium">Usage this month</span>
                </div>
                <p className="font-display text-xl font-semibold text-white">
                  {data.usage.used} / {data.usage.limit}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{data.current_plan} plan</p>
              </div>
            </div>

            <h2 className="font-display text-lg font-semibold text-white mb-4">
              Latest recommendations
            </h2>
            {data.latest_recommendations.length === 0 ? (
              <>
                <div className="glass-card p-10 text-center mb-8">
                  <p className="text-slate-400 mb-4">
                    You haven't run an AI Scout session yet. Start one to get personalized
                    business opportunities.
                  </p>
                  <Link to="/scout" className="btn-primary inline-flex text-sm py-2.5">
                    Start AI Scout <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <h2 className="font-display text-lg font-semibold text-white mb-4">
                  What you get with Business Scout AI
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {BENEFITS.map((b) => (
                    <div key={b.title} className="glass-card p-5">
                      <div className="h-9 w-9 rounded-lg bg-signal-400/10 border border-signal-400/20 flex items-center justify-center mb-3">
                        <b.icon className="h-4.5 w-4.5 text-signal-300" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-100 mb-1.5">{b.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.latest_recommendations.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onToggleSave={(o) => handleToggleSave(o.id, o.saved)}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Compass;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
