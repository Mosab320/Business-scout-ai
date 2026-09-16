import { useState } from "react";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import type { BusinessProfileInput } from "../types";

const STEP_LABELS = ["Budget & Location", "Skills & Interests", "Experience", "Preferences", "Risk Level"];

const SALES_CHANNELS: { value: BusinessProfileInput["sales_channel"]; label: string }[] = [
  { value: "online_store", label: "Own online store" },
  { value: "marketplace", label: "Marketplace (Daraz, Amazon-style)" },
  { value: "social_media", label: "Social media (Instagram/TikTok)" },
  { value: "physical_store", label: "Physical store" },
  { value: "b2b", label: "B2B / businesses" },
  { value: "services", label: "Direct services / bookings" },
];

const DEFAULT_PROFILE: BusinessProfileInput = {
  budget: 100000,
  currency: "PKR",
  country: "",
  city: "",
  business_type: "",
  skills: [],
  interests: [],
  experience: "beginner",
  risk_level: "medium",
  sales_channel: "online_store",
  goal: "",
};

export default function ScoutForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (profile: BusinessProfileInput) => void;
  submitting: boolean;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BusinessProfileInput>(DEFAULT_PROFILE);
  const [skillsInput, setSkillsInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");

  const isLastStep = step === STEP_LABELS.length - 1;

  function update<K extends keyof BusinessProfileInput>(key: K, value: BusinessProfileInput[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function canProceed() {
    if (step === 0) return profile.budget > 0 && profile.country.trim() && profile.city.trim();
    return true;
  }

  function handleSubmit() {
    const finalProfile: BusinessProfileInput = {
      ...profile,
      skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
      interests: interestsInput.split(",").map((s) => s.trim()).filter(Boolean),
    };
    onSubmit(finalProfile);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                i <= step ? "bg-signal-400" : "bg-white/10"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs font-medium text-signal-300 mb-1">
        Step {step + 1} of {STEP_LABELS.length}
      </p>
      <h2 className="font-display text-xl font-semibold text-white mb-6">{STEP_LABELS[step]}</h2>

      <div className="glass-card p-6 sm:p-8 space-y-5">
        {step === 0 && (
          <>
            <div>
              <label className="label-text">Budget (PKR)</label>
              <input
                type="number"
                min={1000}
                className="input-field"
                value={profile.budget}
                onChange={(e) => update("budget", Number(e.target.value))}
                placeholder="e.g. 100000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Country</label>
                <input
                  className="input-field"
                  value={profile.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="Pakistan"
                />
              </div>
              <div>
                <label className="label-text">City</label>
                <input
                  className="input-field"
                  value={profile.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Lahore"
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="label-text">Skills (comma separated)</label>
              <input
                className="input-field"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="design, marketing, teaching"
              />
            </div>
            <div>
              <label className="label-text">Interests (comma separated)</label>
              <input
                className="input-field"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="retail, food, tech"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div>
            <label className="label-text">Experience level</label>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "experienced"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => update("experience", level)}
                  className={`rounded-xl border px-4 py-3 text-sm capitalize transition-colors ${
                    profile.experience === level
                      ? "border-signal-400/60 bg-signal-400/10 text-signal-200"
                      : "border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="label-text">Preferred sales channel</label>
              <select
                className="input-field"
                value={profile.sales_channel}
                onChange={(e) => update("sales_channel", e.target.value as BusinessProfileInput["sales_channel"])}
              >
                {SALES_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Business goal</label>
              <input
                className="input-field"
                value={profile.goal}
                onChange={(e) => update("goal", e.target.value)}
                placeholder="e.g. side income, full-time business, scale-up"
              />
            </div>
          </>
        )}

        {step === 4 && (
          <div>
            <label className="label-text">Risk tolerance</label>
            <div className="grid grid-cols-3 gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => update("risk_level", level)}
                  className={`rounded-xl border px-4 py-3 text-sm capitalize transition-colors ${
                    profile.risk_level === level
                      ? "border-signal-400/60 bg-signal-400/10 text-signal-200"
                      : "border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={back}
          disabled={step === 0}
          className="btn-secondary text-sm py-2.5 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary text-sm py-2.5 disabled:opacity-60"
          >
            {submitting ? "Starting…" : "Start AI Scout"} <Sparkles className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="btn-primary text-sm py-2.5 disabled:opacity-40"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
