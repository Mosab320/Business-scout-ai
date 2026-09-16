import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getSubscription, checkout, friendlyError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { SubscriptionData } from "../types";

export default function Subscription() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getSubscription()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    setMessage(null);
    try {
      const result = await checkout("pro_monthly");
      setMessage(result.message || "Upgraded to Pro!");
      await refreshUser();
      const fresh = await getSubscription();
      setData(fresh);
    } catch (err) {
      setMessage(friendlyError(err, "Checkout failed. Please try again."));
    } finally {
      setUpgrading(false);
    }
  }

  const isPro = user?.plan === "pro";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-display text-2xl font-semibold text-white mb-1">Subscription</h1>
        <p className="text-sm text-slate-400 mb-8">Manage your plan and usage.</p>

        {loading ? (
          <div className="glass-card p-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-signal-400/40 border-t-signal-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="glass-card p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-signal-400/10 border border-signal-400/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-signal-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Scouting Sessions</p>
                  <p className="font-display text-lg font-semibold text-white">
                    {data?.usage.used} / {data?.usage.limit}
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium rounded-full bg-white/[0.05] border border-white/10 px-3 py-1.5 capitalize text-slate-300">
                {user?.plan} plan
              </span>
            </div>

            {message && (
              <div className="rounded-xl bg-signal-400/10 border border-signal-400/20 px-4 py-3 mb-6 text-sm text-signal-200">
                {message}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="glass-card p-6">
                <p className="text-sm text-slate-400 mb-1">Free</p>
                <p className="font-display text-3xl font-semibold text-white mb-4">PKR 0</p>
                <ul className="space-y-2 mb-6 text-sm text-slate-400">
                  <Feature text={`${data?.pricing.free.sessions_per_month ?? 2} scouting sessions / month`} />
                  <Feature text="Basic opportunity analysis" />
                  <Feature text="Top 3 ideas" />
                  <Feature text="Basic AI score" />
                </ul>
                <button className="btn-secondary w-full text-sm py-2.5" disabled>
                  {isPro ? "Downgrade unavailable in demo" : "Current plan"}
                </button>
              </div>

              <div className="glass-card p-6 border-signal-400/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-[10px] font-medium bg-gradient-to-r from-signal-400 to-violet-500 text-ink-950 px-3 py-1 rounded-bl-xl">
                  RECOMMENDED
                </div>
                <p className="text-sm text-slate-400 mb-1">Pro</p>
                <p className="font-display text-3xl font-semibold text-white mb-4">
                  PKR {data?.pricing.pro_monthly.price ?? 999}
                  <span className="text-sm text-slate-500 font-normal">/month</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-slate-400">
                  <Feature text={`${data?.pricing.pro_monthly.sessions_per_month ?? 30} scouting sessions / month`} />
                  <Feature text="Detailed competitor analysis" />
                  <Feature text="Full financial analysis" />
                  <Feature text="Marketing strategy" />
                  <Feature text="30-day launch plan" />
                  <Feature text="Full business plan + PDF export" />
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={isPro || upgrading}
                  className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
                >
                  {isPro ? "You're on Pro" : upgrading ? "Processing…" : "Upgrade to Pro"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-3.5 w-3.5 text-signal-400 shrink-0" /> {text}
    </li>
  );
}
