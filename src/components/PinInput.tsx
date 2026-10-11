"use client";

import { useRef } from "react";

export default function PinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button type="button" onClick={() => ref.current?.focus()} className="relative flex w-full justify-center gap-3">
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="PIN de 4 dígitos"
        className="absolute inset-0 opacity-0"
      />
      {[0, 1, 2, 3].map((i) => {
        const filled = i < value.length;
        const active = i === Math.min(value.length, 3);
        return (
          <span
            key={i}
            className={`flex h-14 w-12 items-center justify-center rounded-2xl border-2 text-2xl transition-all ${
              filled ? "border-gold bg-gold/15 scale-105" : active ? "border-white/40 bg-white/10" : "border-white/15 bg-white/5"
            }`}
          >
            {filled ? "🎄" : ""}
          </span>
        );
      })}
    </button>
  );
}
