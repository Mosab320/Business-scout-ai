import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import OpportunityCard from "../components/OpportunityCard";
import { listOpportunities, saveOpportunity, unsaveOpportunity } from "../services/api";
import type { Opportunity } from "../types";

export default function SavedOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOpportunities()
      .then((all) => setOpportunities(all.filter((o) => o.saved)))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleSave(opp: Opportunity) {
    await unsaveOpportunity(opp.id);
    setOpportunities((prev) => prev.filter((o) => o.id !== opp.id));
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-display text-2xl font-semibold text-white mb-1">Saved Opportunities</h1>
        <p className="text-sm text-slate-400 mb-8">Business ideas you've bookmarked for later.</p>

        {loading ? (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-slate-400 mb-4">You haven't saved any opportunities yet.</p>
            <Link to="/scout" className="btn-primary inline-flex text-sm py-2.5">
              Start AI Scout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} onToggleSave={handleToggleSave} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
