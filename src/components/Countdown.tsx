"use client";

import { useEffect, useState } from "react";

function diff(date: string) {
  const ms = Math.max(0, new Date(`${date}T18:00:00`).getTime() - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

export default function Countdown({ date }: { date: string }) {
  const [t, setT] = useState(() => diff(date));
  useEffect(() => {
    const id = setInterval(() => setT(diff(date)), 1000);
    return () => clearInterval(id);
  }, [date]);

  const cells: [number, string][] = [
    [t.d, "días"],
    [t.h, "horas"],
    [t.m, "min"],
    [t.s, "seg"],
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map(([v, label]) => (
        <div key={label} className="glass flex flex-col items-center rounded-2xl py-2">
          <span className="text-2xl font-semibold tabular-nums text-gold">{String(v).padStart(2, "0")}</span>
          <span className="text-[11px] uppercase tracking-wider text-snow/50">{label}</span>
        </div>
      ))}
    </div>
  );
}
