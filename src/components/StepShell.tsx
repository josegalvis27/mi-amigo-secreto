"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

type Props = {
  step: number;
  total: number;
  onBack: () => void;
  title: string;
  subtitle?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

/** Pantalla de un paso: cabe completa en el alto del navegador, con el botón siempre visible abajo. */
export default function StepShell({ step, total, onBack, title, subtitle, footer, children }: Props) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <div className="flex items-center gap-3 px-4 pt-3">
        <button onClick={onBack} className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg" aria-label="Volver">
          ←
        </button>
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-gold" : "bg-white/15"}`} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="flex min-h-0 flex-1 flex-col px-5 pt-4"
        >
          <h1 className="font-xmas text-[2.1rem] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-snow/60">{subtitle}</p>}
          <div className="-mx-5 mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">{children}</div>
        </motion.div>
      </AnimatePresence>
      <div className="safe-bottom px-5 pt-2">{footer}</div>
    </main>
  );
}
