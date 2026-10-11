"use client";

import { AVATAR_EMOJIS, type CostumeId } from "@/lib/store";
import type { WishDraft } from "@/lib/ideas";
import PinInput from "./PinInput";

export type MemberDraft = {
  name: string;
  phone: string;
  pin: string;
  photo?: string;
  emoji: string;
  costume?: CostumeId;
  wishes: WishDraft[];
};

export const emptyMember = (): MemberDraft => ({
  name: "",
  phone: "",
  pin: "",
  emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
  costume: "sueter",
  wishes: [],
});

export const dataValid = (m: MemberDraft) => m.phone.replace(/\D/g, "").length >= 10 && m.pin.length === 4;

/** Nombre va en el paso de la foto; aquí solo WhatsApp + PIN. */
export default function DataFields({ value, onChange }: { value: MemberDraft; onChange: (m: MemberDraft) => void }) {
  const set = (patch: Partial<MemberDraft>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-snow/70">Tu WhatsApp</span>
        <input
          className="field"
          value={value.phone}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="0414 123 4567"
          inputMode="tel"
          autoComplete="tel"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-sm text-snow/70">Inventa un PIN de 4 números</span>
        <PinInput value={value.pin} onChange={(pin) => set({ pin })} />
      </div>
      <p className="glass rounded-2xl p-3 text-center text-sm text-snow/70">
        🔐 Con tu número + PIN entras desde cualquier teléfono y no pierdes tu carta ni tu amigo secreto.
      </p>
    </div>
  );
}
