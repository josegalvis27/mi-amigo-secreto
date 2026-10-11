"use client";

import { useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import confetti from "canvas-confetti";
import type { PublicMember as Member } from "@/lib/types";
import { GiftBox, GiftLid } from "./Gift";
import Polaroid from "./Polaroid";

const TAPS_TO_OPEN = 3;
const HINTS = ["Toca el regalo 👆", "¡Otra vez! 🔥", "¡Una más y se abre! 😱"];

function boom() {
  const colors = ["#ff5d73", "#ffc94a", "#4ade80", "#ffffff", "#60a5fa"];
  confetti({ particleCount: 140, spread: 100, origin: { y: 0.55 }, colors, scalar: 1.1 });
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors }), 250);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors }), 400);
}

export default function GiftReveal({ receiver, alreadyRevealed, onRevealed }: {
  receiver: Member;
  alreadyRevealed: boolean;
  onRevealed: () => void;
}) {
  const [taps, setTaps] = useState(alreadyRevealed ? TAPS_TO_OPEN : 0);
  const open = taps >= TAPS_TO_OPEN;
  const shake = useAnimationControls();

  async function tap() {
    if (open) return;
    const next = taps + 1;
    navigator.vibrate?.(next === TAPS_TO_OPEN ? [40, 40, 120] : 30 * next);
    setTaps(next);
    if (next < TAPS_TO_OPEN) {
      const a = 6 + next * 6;
      await shake.start({ rotate: [0, -a, a, -a / 2, a / 2, 0], scale: [1, 1.08, 1], transition: { duration: 0.5 } });
    } else {
      boom();
      onRevealed();
    }
  }

  return (
    <div className="relative -mx-5 flex min-h-[520px] flex-col items-center justify-center overflow-hidden px-5">
      {/* rayos de luz detrás */}
      <motion.div
        aria-hidden
        className="absolute h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, rgba(255,201,74,0.18) 0deg 10deg, transparent 10deg 24deg)",
          maskImage: "radial-gradient(circle, black 20%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 65%)",
        }}
        animate={{ rotate: 360, opacity: open ? 1 : 0.25 + taps * 0.2, scale: open ? 1.2 : 0.8 + taps * 0.08 }}
        transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, default: { duration: 0.6 } }}
      />

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="gift"
            type="button"
            onClick={tap}
            className="relative flex flex-col items-center"
            exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.35 } }}
            aria-label="Abrir regalo"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
              <motion.div animate={shake} className="flex flex-col items-center">
                <motion.div animate={{ y: taps * -4, rotate: taps * -3 }}>
                  <GiftLid size={170} />
                </motion.div>
                <GiftBox size={170} />
              </motion.div>
            </motion.div>
            <motion.p
              key={taps}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 text-xl font-medium"
            >
              {HINTS[taps]}
            </motion.p>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: TAPS_TO_OPEN }, (_, i) => (
                <span key={i} className={`h-2 w-8 rounded-full transition ${i < taps ? "bg-gold" : "bg-white/15"}`} />
              ))}
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="reveal"
            className="relative flex flex-col items-center"
            initial={alreadyRevealed ? false : { scale: 0.2, y: 80, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 120, delay: 0.1 }}
          >
            <motion.p
              initial={alreadyRevealed ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 text-center text-lg text-snow/80"
            >
              Tu amigo secreto es…
            </motion.p>
            <Polaroid member={receiver} size="lg" rotate={-3} />
            <motion.h2
              initial={alreadyRevealed ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="text-shine mt-6 text-center font-xmas text-5xl font-bold"
            >
              ¡{receiver.name}!
            </motion.h2>
            <p className="mt-2 text-sm text-snow/60">🤫 Shhh… que nadie se entere</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
