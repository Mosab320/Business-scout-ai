import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Radar } from "lucide-react";

const STEPS = [
  "Understanding your profile",
  "Creating research strategy",
  "Finding market opportunities",
  "Analyzing competition",
  "Calculating financial estimates",
  "Evaluating opportunity scores",
  "Creating business strategy",
];

export default function ResearchAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="relative h-40 w-40 mb-10 flex items-center justify-center">
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-signal-400/30"
            style={{ height: 80 + ring * 36, width: 80 + ring * 36 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: ring * 0.3, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          className="relative h-16 w-16 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 35% 30%, #5eead4, #8b5cf6 70%)",
            boxShadow: "0 0 40px rgba(94,234,212,0.35)",
          }}
          animate={{ boxShadow: ["0 0 30px rgba(94,234,212,0.25)", "0 0 55px rgba(139,92,246,0.4)", "0 0 30px rgba(94,234,212,0.25)"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Radar className="h-7 w-7 text-ink-950" />
        </motion.div>
      </div>

      <h2 className="font-display text-xl sm:text-2xl font-semibold text-white mb-1 text-center">
        AI Scout is researching your opportunity…
      </h2>
      <p className="text-sm text-slate-500 mb-10 text-center">
        Multiple specialized agents are working on your profile
      </p>

      <div className="w-full max-w-md space-y-2">
        <AnimatePresence>
          {STEPS.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            if (i > activeStep) return null;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-2.5"
              >
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                    done
                      ? "bg-signal-400 text-ink-950"
                      : "border border-signal-400/50"
                  }`}
                >
                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <motion.div
                      className="h-2 w-2 rounded-full bg-signal-400"
                      animate={active ? { opacity: [1, 0.3, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className={`text-sm ${done ? "text-slate-300" : "text-slate-100"}`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
