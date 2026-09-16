import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Radar,
  ArrowRight,
  Target,
  TrendingUp,
  Calculator,
  Rocket,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    icon: Target,
    title: "Tell us your starting point",
    desc: "Budget, location, skills, interests and how much risk you're comfortable with.",
  },
  {
    icon: Radar,
    title: "Watch the AI scout research",
    desc: "Seven specialized agents research demand, competitors and costs in real time.",
  },
  {
    icon: TrendingUp,
    title: "Compare scored opportunities",
    desc: "Every idea gets a transparent 0-100 score with the reasoning behind it.",
  },
  {
    icon: Rocket,
    title: "Get your 30-day plan",
    desc: "A complete business plan and execution roadmap, ready to act on today.",
  },
];

const SAMPLE_IDEAS = [
  { name: "Home Organization Products", score: 87, cost: "PKR 27,000" },
  { name: "Educational Services / Tutoring", score: 81, cost: "PKR 4,000" },
  { name: "Customized Gift Business", score: 82, cost: "PKR 22,500" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 text-slate-200 overflow-x-hidden">
      <div className="grid-bg absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Radar className="h-6 w-6 text-signal-400" />
          <span className="font-display font-semibold text-lg text-white">
            Business Scout <span className="text-gradient">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2">
            Log in
          </Link>
          <Link to="/register" className="btn-primary text-sm py-2.5 px-5">
            Start AI Scout
          </Link>
        </div>
      </header>

      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium text-signal-300 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Multi-agent AI business research
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl font-semibold text-white leading-[1.1] tracking-tight"
        >
          Discover your next
          <br />
          <span className="text-gradient">business opportunity.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-slate-400 max-w-xl mx-auto"
        >
          Tell our AI your budget, skills and goals. Business Scout AI researches the
          market and builds a personalized strategy — from idea to action.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register" className="btn-primary">
            Start AI Scout <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className="btn-secondary">
            See How It Works
          </a>
        </motion.div>
      </section>

      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white text-center mb-3">
          Your AI business co-pilot
        </h2>
        <p className="text-slate-400 text-center max-w-lg mx-auto mb-12">
          Seven specialized agents work together to research, score, and plan your business.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="glass-card glass-card-hover p-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-signal-400/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-4">
                <step.icon className="h-5 w-5 text-signal-300" />
              </div>
              <p className="text-xs text-slate-500 mb-1">Step {i + 1}</p>
              <h3 className="font-medium text-slate-100 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="glass-card p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">
                Real opportunities, scored transparently
              </h2>
              <p className="text-sm text-slate-400 mt-1">Example output from a recent AI Scout session</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {SAMPLE_IDEAS.map((idea) => (
              <div key={idea.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-display font-semibold text-signal-300">
                    {idea.score}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <p className="text-sm font-medium text-slate-100 mb-1">{idea.name}</p>
                <p className="text-xs text-slate-500">Est. startup cost: {idea.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-28 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-4">
          From business idea to business action.
        </h2>
        <Link to="/register" className="btn-primary inline-flex">
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-sm text-slate-500">
        Business Scout AI — research-based estimates, not guaranteed outcomes.
      </footer>
    </div>
  );
}
