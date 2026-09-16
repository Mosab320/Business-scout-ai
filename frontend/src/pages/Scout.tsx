import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Scale } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import ScoutForm from "../components/ScoutForm";
import ResearchAnimation from "../components/ResearchAnimation";
import OpportunityCard from "../components/OpportunityCard";
import { startScout, saveOpportunity, unsaveOpportunity, friendlyError } from "../services/api";
import type { BusinessProfileInput, Opportunity, ScoutResult } from "../types";

type Phase = "form" | "researching" | "results";

export default function Scout() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("form");
  const [result, setResult] = useState<ScoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  async function handleSubmit(profile: BusinessProfileInput) {
    setError(null);
    setPhase("researching");
    try {
      // Let the research animation play for a moment even though the
      // pipeline itself may resolve quickly.
      const [scoutResult] = await Promise.all([
        startScout(profile),
        new Promise((resolve) => setTimeout(resolve, 4500)),
      ]);
      setResult(scoutResult);
      setPhase("results");
    } catch (err) {
      setError(friendlyError(err, "We couldn't complete your AI Scout session. Please try again."));
      setPhase("form");
    }
  }

  async function handleToggleSave(opp: Opportunity) {
    if (!result) return;
    if (opp.saved) {
      await unsaveOpportunity(opp.id);
    } else {
      await saveOpportunity(opp.id);
    }
    setResult({
      ...result,
      opportunities: result.opportunities.map((o) =>
        o.id === opp.id ? { ...o, saved: !opp.saved } : o
      ),
    });
  }

  function toggleCompare(opp: Opportunity) {
    setCompareIds((ids) => {
      if (ids.includes(opp.id)) return ids.filter((id) => id !== opp.id);
      if (ids.length >= 5) return ids;
      return [...ids, opp.id];
    });
  }

  function goToComparison() {
    navigate("/compare", { state: { opportunityIds: compareIds } });
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
        {phase === "form" && (
          <>
            <h1 className="font-display text-2xl font-semibold text-white mb-1 text-center">
              Start your AI Scout
            </h1>
            <p className="text-sm text-slate-400 text-center mb-10">
              A few details, then let the agents do the research.
            </p>
            {error && (
              <div className="max-w-xl mx-auto flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <ScoutForm onSubmit={handleSubmit} submitting={false} />
          </>
        )}

        {phase === "researching" && <ResearchAnimation />}

        {phase === "results" && result && (
          <div>
            <div className="mb-8">
              <h1 className="font-display text-2xl font-semibold text-white mb-2">
                Your Business Opportunities
              </h1>
              {result.advisor_summary && (
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  {result.advisor_summary}
                </p>
              )}
            </div>

            {compareIds.length >= 2 && (
              <div className="glass-card px-5 py-3 mb-6 flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {compareIds.length} opportunities selected
                </span>
                <button onClick={goToComparison} className="btn-primary text-sm py-2">
                  <Scale className="h-4 w-4" /> Compare
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onToggleSave={handleToggleSave}
                  showCompare
                  compareSelected={compareIds.includes(opp.id)}
                  onSelectCompare={toggleCompare}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
