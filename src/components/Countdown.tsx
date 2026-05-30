import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function targetTime() {
  // Ends tonight at midnight in user's local time
  const t = new Date();
  t.setHours(23, 59, 59, 0);
  return t.getTime();
}

function FlipDigit({ value }: { value: string }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function Countdown({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(Date.now());
  const [target] = useState(targetTime());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (compact) {
    return (
      <span className="font-mono tabular-nums text-foreground">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono tabular-nums">
      {[
        { v: h, l: "Hrs" },
        { v: m, l: "Min" },
        { v: s, l: "Seg" },
      ].map((u, i) => (
        <div key={u.l} className="flex items-center gap-2">
          {i > 0 && <span className="text-muted-foreground">:</span>}
          <div className="flex flex-col items-center">
            <span className="flex h-12 w-14 items-center justify-center rounded-xl border border-border bg-surface text-xl font-semibold text-foreground">
              <FlipDigit value={pad(u.v)} />
            </span>
            <span className="mt-1.5 text-[9px] uppercase tracking-widest text-muted-foreground">
              {u.l}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
