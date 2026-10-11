"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ideasFor, type WishDraft } from "@/lib/ideas";

type Props = { budget: number | null; wishes: WishDraft[]; onChange: (w: WishDraft[]) => void };

/** Arma la carta rápido: ideas que caben en el presupuesto + algo propio. */
export default function LetterStep({ budget, wishes, onChange }: Props) {
  const [custom, setCustom] = useState("");
  const ideas = ideasFor(budget);
  const has = (t: string) => wishes.some((w) => w.title === t);

  function toggle(idea: WishDraft) {
    navigator.vibrate?.(10);
    onChange(has(idea.title) ? wishes.filter((w) => w.title !== idea.title) : [...wishes, idea]);
  }

  function addCustom() {
    const title = custom.trim();
    if (!title || has(title)) return;
    onChange([...wishes, { title, emoji: "🎁" }]);
    setCustom("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {ideas.map((idea) => {
          const on = has(idea.title);
          return (
            <motion.button
              key={idea.title}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => toggle(idea)}
              className={`rounded-full px-2.5 py-1.5 text-[13px] transition ${on ? "btn-gold font-semibold" : "glass"}`}
            >
              {idea.emoji} {idea.title} <span className={on ? "text-ink/60" : "text-snow/40"}>${idea.price}</span>
            </motion.button>
          );
        })}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addCustom();
        }}
      >
        <input className="field" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Otra cosa que quieras…" maxLength={60} />
        <button disabled={!custom.trim()} className="btn-primary shrink-0 rounded-2xl px-5 text-xl font-bold disabled:opacity-40">
          +
        </button>
      </form>

      <div
        className="rounded-3xl px-4 py-3 text-ink"
        style={{ background: "linear-gradient(180deg, #fffaf0, #f7eedb)" }}
      >
        <p className="font-hand text-lg text-pine/80">Querido Niño Jesús, quiero…</p>
        {wishes.length === 0 ? (
          <p className="py-2 font-hand text-xl text-ink/40">Toca las ideas de arriba ☝️</p>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {wishes.map((w) => (
                <motion.li
                  key={w.title}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 overflow-hidden font-hand text-xl leading-8"
                >
                  <span className="text-lg">{w.emoji}</span>
                  <span className="flex-1 truncate">{w.title}</span>
                  <button type="button" onClick={() => onChange(wishes.filter((x) => x.title !== w.title))} className="px-2 text-sm text-ink/40" aria-label={`Quitar ${w.title}`}>
                    ✕
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
