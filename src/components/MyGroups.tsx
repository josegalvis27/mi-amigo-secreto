"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

type Mine = { code: string; name: string; emoji: string; date: string; pending: boolean };

/** Fila con los grupos en los que ya estás (puedes estar en varios). */
export default function MyGroups() {
  const [groups, setGroups] = useState<Mine[]>([]);

  useEffect(() => {
    fetch("/api/mine", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setGroups)
      .catch(() => {});
  }, []);

  if (!groups.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full text-left">
      <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-snow/50">Mis grupos</p>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {groups.map((g) => (
          <Link key={g.code} href={`/g/${g.code}`} className="glass relative flex shrink-0 items-center gap-2 rounded-2xl py-2 pl-2.5 pr-3.5">
            <span className="text-2xl">{g.emoji}</span>
            <span className="max-w-36 truncate text-sm font-medium">{g.name}</span>
            {g.pending && <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-berry-2" />}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
