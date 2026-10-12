"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { AVATAR_EMOJIS, type CostumeId } from "@/lib/types";
import { loadImage } from "@/lib/image";
import CostumeChips from "./CostumeChips";
import PhotoStudio from "./PhotoStudio";
import Polaroid from "./Polaroid";
import Sheet from "./Sheet";

export type Look = { name: string; photo?: string; emoji: string; costume?: CostumeId };

/** Foto (o avatar emoji) + disfraz navideño. */
export default function LookPicker({ value, onChange }: { value: Look; onChange: (patch: Partial<Look>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [choosing, setChoosing] = useState(false);
  const [studio, setStudio] = useState<"camera" | HTMLImageElement | null>(null);
  const costume = value.costume ?? "none";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        onClick={() => setChoosing(true)}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: [-3, -1, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        aria-label="Cambiar foto"
      >
        <Polaroid member={{ ...value, name: value.name || "Tu nombre" }} size="md" width="w-[min(52vw,30dvh)]" />
        <span className="btn-gold absolute -bottom-3 -right-3 flex h-11 w-11 items-center justify-center rounded-full text-xl">📸</span>
      </motion.button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) setStudio(await loadImage(f));
        }}
      />

      <div className="w-full">
        <p className="mb-2 text-center text-sm text-snow/60">Escoge tu disfraz</p>
        <CostumeChips costume={costume} photo={value.photo} emoji={value.emoji} onPick={(c) => onChange({ costume: c })} />
      </div>

      {!value.photo && (
        <div className="w-full">
          <p className="mb-2 text-center text-sm text-snow/60">¿Sin foto? Usa un avatar</p>
          <div className="flex justify-center gap-1.5">
            {AVATAR_EMOJIS.slice(0, 7).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onChange({ emoji: e })}
                className={`h-10 w-10 rounded-full text-xl transition ${value.emoji === e ? "bg-gold/25 ring-2 ring-gold" : "bg-white/5"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
      {value.photo && (
        <button type="button" onClick={() => onChange({ photo: undefined })} className="text-xs text-snow/50 underline">
          Quitar foto
        </button>
      )}

      <Sheet open={choosing} onClose={() => setChoosing(false)}>
        <div className="flex flex-col gap-3 pb-6">
          <h3 className="text-center font-xmas text-3xl font-bold">Tu foto navideña 📸</h3>
          <p className="-mt-1 text-center text-sm text-snow/60">Te verás con el disfraz antes de tomarla</p>
          <button
            type="button"
            onClick={() => {
              setChoosing(false);
              setStudio("camera");
            }}
            className="btn-primary flex items-center gap-3 rounded-2xl px-5 py-4 text-left active:scale-[0.97]"
          >
            <span className="text-3xl">🤳</span>
            <span>
              <b className="block text-lg">Cámara con disfraz</b>
              <span className="text-sm opacity-80">Mírate en vivo con el disfraz</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setChoosing(false);
              fileRef.current?.click();
            }}
            className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-left active:scale-[0.97]"
          >
            <span className="text-3xl">🖼️</span>
            <span>
              <b className="block text-lg">Desde la galería</b>
              <span className="text-sm text-snow/60">Acomódala y prueba disfraces</span>
            </span>
          </button>
        </div>
      </Sheet>

      {studio && (
        <PhotoStudio
          start={studio}
          name={value.name}
          emoji={value.emoji}
          costume={value.photo || costume !== "none" ? costume : "sueter"}
          onClose={() => setStudio(null)}
          onDone={(photo, c) => {
            onChange({ photo, costume: c });
            setStudio(null);
          }}
        />
      )}
    </div>
  );
}
