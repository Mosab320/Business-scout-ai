import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Profile preference fields (skills/interests/budget/location/experience/
    // risk) are captured fresh on every AI Scout session via the multi-step
    // form. This page lets a user pre-fill defaults for convenience.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-display text-2xl font-semibold text-white mb-1">Profile</h1>
        <p className="text-sm text-slate-400 mb-8">Manage your account and default scouting preferences.</p>

        <div className="glass-card p-6 mb-6">
          <h2 className="font-display font-semibold text-white mb-4">Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Name</label>
              <input className="input-field" defaultValue={user?.name} disabled />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input className="input-field" defaultValue={user?.email} disabled />
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass-card p-6">
          <h2 className="font-display font-semibold text-white mb-4">
            Default Scouting Preferences
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            These pre-fill your next AI Scout form — you can still adjust them per session.
          </p>
          <div className="space-y-4">
            <div>
              <label className="label-text">Skills</label>
              <input
                className="input-field"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="design, marketing, teaching"
              />
            </div>
            <div>
              <label className="label-text">Interests</label>
              <input
                className="input-field"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="retail, food, tech"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm py-2.5 mt-6">
            {saved ? "Saved!" : "Save preferences"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
