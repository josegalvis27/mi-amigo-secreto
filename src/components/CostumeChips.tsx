"use client";

import { motion } from "motion/react";
import type { CostumeId } from "@/lib/types";
import Character, { COSTUMES, COSTUME_IDS } from "./Character";

type Props = { costume: CostumeId; photo?: string; emoji: string; onPick: (c: CostumeId) => void; size?: "sm" | "md" };

/** Fila deslizable con los disfraces. */
export default function CostumeChips({ costume, photo, emoji, onPick, size = "md" }: Props) {
  const box = size === "sm" ? "h-12 w-12" : "h-14 w-14";
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
      {COSTUME_IDS.map((id) => {
        const active = costume === id;
        return (
          <motion.button
            key={id}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onPick(id)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 transition ${active ? "bg-gold/20 ring-2 ring-gold" : "bg-white/5"}`}
          >
            <span className={`block ${box} overflow-hidden rounded-xl`}>
              {id === "none" ? (
                photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-pine text-3xl">{emoji}</span>
                )
              ) : (
                <Character costume={id} photo={photo} emoji={emoji} className="h-full w-full" />
              )}
            </span>
            <span className="text-[11px]">{id === "none" ? "Normal" : COSTUMES[id].label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
