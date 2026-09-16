import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { listBusinessPlans } from "../services/api";
import type { BusinessPlan } from "../types";

export default function BusinessPlansList() {
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBusinessPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-display text-2xl font-semibold text-white mb-1">Business Plans</h1>
        <p className="text-sm text-slate-400 mb-8">Full plans generated from your scouted opportunities.</p>

        {loading ? (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-slate-400 mb-4">You haven't generated a business plan yet.</p>
            <Link to="/scout" className="btn-primary inline-flex text-sm py-2.5">
              Start AI Scout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/plans/${plan.id}`}
                className="glass-card glass-card-hover p-6 flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-signal-400/10 border border-signal-400/20 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-signal-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-slate-100 mb-1">{plan.business_name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{plan.executive_summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
