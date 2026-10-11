"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { compressPhoto } from "@/lib/image";
import Polaroid from "./Polaroid";

type Props = {
  name: string;
  emoji: string;
  photo?: string;
  onChange: (photo: string | undefined) => void;
};

export default function PhotoPicker({ name, emoji, photo, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await compressPhoto(file));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95, rotate: 0 }}
        animate={{ rotate: [-3, -1, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => ref.current?.click()}
        className="relative"
      >
        <Polaroid member={{ name: name || "Tu nombre", emoji, photo }} size="md" />
        <span className="btn-gold absolute -bottom-3 -right-3 flex h-11 w-11 items-center justify-center rounded-full text-xl">
          {busy ? "⏳" : "📸"}
        </span>
      </motion.button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <p className="text-sm text-snow/60">{photo ? "¡Qué foto tan navideña! Toca para cambiarla" : "Toca para ponerle tu foto"}</p>
    </div>
  );
}
