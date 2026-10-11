"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { AVATAR_EMOJIS, type CostumeId } from "@/lib/types";
import { loadImage } from "@/lib/image";
import Character, { COSTUMES, COSTUME_IDS } from "./Character";
import FaceCropper from "./FaceCropper";
import Polaroid from "./Polaroid";

export type Look = { name: string; photo?: string; emoji: string; costume?: CostumeId };

/** Foto (o avatar emoji) + disfraz navideño. */
export default function LookPicker({ value, onChange }: { value: Look; onChange: (patch: Partial<Look>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const costume = value.costume ?? "none";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        onClick={() => fileRef.current?.click()}
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
          if (f) setImg(await loadImage(f));
        }}
      />

      <div className="w-full">
        <p className="mb-2 text-center text-sm text-snow/60">Escoge tu disfraz</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {COSTUME_IDS.map((id) => {
            const active = costume === id;
            return (
              <motion.button
                key={id}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange({ costume: id })}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 transition ${active ? "bg-gold/20 ring-2 ring-gold" : "bg-white/5"}`}
              >
                <span className="block h-14 w-14 overflow-hidden rounded-xl">
                  {id === "none" ? (
                    value.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={value.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-pine text-3xl">{value.emoji}</span>
                    )
                  ) : (
                    <Character costume={id} photo={value.photo} emoji={value.emoji} className="h-full w-full" />
                  )}
                </span>
                <span className="text-[11px]">{id === "none" ? "Normal" : COSTUMES[id].label}</span>
              </motion.button>
            );
          })}
        </div>
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

      <FaceCropper
        key={img?.src ?? "none"}
        image={img}
        onClose={() => setImg(null)}
        onDone={(photo) => {
          onChange({ photo, costume: costume === "none" ? "sueter" : costume });
          setImg(null);
        }}
      />
    </div>
  );
}
