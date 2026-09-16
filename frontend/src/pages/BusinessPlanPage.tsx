import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle2, Circle } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getBusinessPlan, updateTaskStatus, exportPlanPdfUrl, friendlyError } from "../services/api";
import type { BusinessPlan, DayTask } from "../types";

const WEEK_THEMES: Record<number, string> = {
  1: "Research & Setup",
  2: "Product / Service Preparation",
  3: "Branding & Marketing",
  4: "Launch & Optimization",
};

const SECTIONS: { key: keyof BusinessPlan; title: string }[] = [
  { key: "executive_summary", title: "Executive Summary" },
  { key: "business_concept", title: "Business Concept" },
  { key: "target_customer", title: "Target Customer" },
  { key: "product_strategy", title: "Product / Service Strategy" },
  { key: "competitor_strategy", title: "Competitor Strategy" },
  { key: "marketing_strategy", title: "Marketing Strategy" },
  { key: "operations", title: "Operations" },
];

export default function BusinessPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getBusinessPlan(id)
      .then(setPlan)
      .catch((err) => setError(friendlyError(err, "Couldn't load this business plan.")))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleTask(task: DayTask) {
    if (!plan) return;
    const newStatus = task.status === "completed" ? "pending" : "completed";
    setPlan({
      ...plan,
      launch_plan: plan.launch_plan.map((t) =>
        t.day === task.day ? { ...t, status: newStatus } : t
      ),
    });
    try {
      await updateTaskStatus(plan.id, task.day, newStatus);
    } catch {
      // Revert on failure
      setPlan((p) =>
        p
          ? {
              ...p,
              launch_plan: p.launch_plan.map((t) =>
                t.day === task.day ? { ...t, status: task.status } : t
              ),
            }
          : p
      );
    }
  }

  const weeks = plan
    ? [1, 2, 3, 4].map((w) => ({
        week: w,
        theme: WEEK_THEMES[w],
        tasks: plan.launch_plan.filter((t) => t.week === w),
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
        {error && <p className="text-red-300 text-sm">{error}</p>}

        {plan && (
          <>
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-xs text-signal-300 font-medium mb-1">Business Plan</p>
                <h1 className="font-display text-2xl font-semibold text-white">{plan.business_name}</h1>
              </div>
              <a
                href={exportPlanPdfUrl(plan.id)}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-sm py-2.5"
              >
                <Download className="h-4 w-4" /> Export PDF
              </a>
            </div>

            <div className="space-y-5 mb-10">
              {SECTIONS.map(({ key, title }) => (
                <div key={String(key)} className="glass-card p-6">
                  <h2 className="font-display font-semibold text-white mb-2">{title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                    {String(plan[key] ?? "")}
                  </p>
                </div>
              ))}

              {plan.sales_channels?.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-white mb-3">Sales Channels</h2>
                  <div className="flex flex-wrap gap-2">
                    {plan.sales_channels.map((c) => (
                      <span
                        key={c}
                        className="text-xs rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-slate-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {plan.risks?.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-display font-semibold text-white mb-3">Risks</h2>
                  <ul className="space-y-2">
                    {plan.risks.map((r, i) => (
                      <li key={i} className="text-sm text-slate-400 flex gap-2">
                        <span className="text-amber-400">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <h2 className="font-display text-lg font-semibold text-white mb-5">
              30-Day Execution Plan
            </h2>
            <div className="space-y-6">
              {weeks.map((w) => (
                <div key={w.week} className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium rounded-full bg-signal-400/10 text-signal-300 border border-signal-400/20 px-3 py-1">
                      Week {w.week}
                    </span>
                    <h3 className="font-medium text-slate-100">{w.theme}</h3>
                  </div>
                  <div className="space-y-2">
                    {w.tasks.map((task) => (
                      <button
                        key={task.day}
                        onClick={() => toggleTask(task)}
                        className="w-full flex items-start gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-signal-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              task.status === "completed"
                                ? "text-slate-500 line-through"
                                : "text-slate-200"
                            }`}
                          >
                            Day {task.day}: {task.task}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
