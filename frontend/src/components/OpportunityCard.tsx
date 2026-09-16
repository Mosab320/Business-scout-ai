import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, TrendingUp, Layers, Gauge } from "lucide-react";
import type { Opportunity } from "../types";

function scoreColor(score: number) {
  if (score >= 80) return "text-signal-300";
  if (score >= 60) return "text-amber-300";
  return "text-slate-400";
}

export default function OpportunityCard({
  opportunity,
  onToggleSave,
  onSelectCompare,
  compareSelected,
  showCompare,
}: {
  opportunity: Opportunity;
  onToggleSave?: (opp: Opportunity) => void;
  onSelectCompare?: (opp: Opportunity) => void;
  compareSelected?: boolean;
  showCompare?: boolean;
}) {
  return (
    <div className="glass-card glass-card-hover p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`font-display text-3xl font-semibold ${scoreColor(opportunity.score)}`}>
            {opportunity.score}
          </span>
          <span className="text-xs text-slate-500 ml-1">/100</span>
        </div>
        <div className="flex items-center gap-2">
          {showCompare && (
            <button
              onClick={() => onSelectCompare?.(opportunity)}
              className={`text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${
                compareSelected
                  ? "border-signal-400/50 text-signal-300 bg-signal-400/10"
                  : "border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              Compare
            </button>
          )}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(opportunity)}
              className="text-slate-400 hover:text-signal-300 transition-colors"
              title={opportunity.saved ? "Remove from saved" : "Save opportunity"}
            >
              {opportunity.saved ? (
                <BookmarkCheck className="h-5 w-5 text-signal-400" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      <h3 className="font-medium text-slate-100 mb-1.5">{opportunity.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {opportunity.description}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-lg bg-white/[0.03] border border-white/5 py-2">
          <TrendingUp className="h-3.5 w-3.5 mx-auto mb-1 text-slate-500" />
          <p className="text-xs capitalize text-slate-300">{opportunity.demand}</p>
          <p className="text-[10px] text-slate-500">Demand</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 py-2">
          <Layers className="h-3.5 w-3.5 mx-auto mb-1 text-slate-500" />
          <p className="text-xs capitalize text-slate-300">{opportunity.competition}</p>
          <p className="text-[10px] text-slate-500">Competition</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/5 py-2">
          <Gauge className="h-3.5 w-3.5 mx-auto mb-1 text-slate-500" />
          <p className="text-xs capitalize text-slate-300">{opportunity.difficulty}</p>
          <p className="text-[10px] text-slate-500">Difficulty</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-5">
        <span className="text-slate-500">Startup cost</span>
        <span className="text-slate-200 font-medium">
          PKR {opportunity.startup_cost.toLocaleString()}
        </span>
      </div>

      <Link
        to={`/opportunities/${opportunity.id}`}
        className="btn-secondary w-full mt-auto text-sm py-2.5"
      >
        View Analysis
      </Link>
    </div>
  );
}
