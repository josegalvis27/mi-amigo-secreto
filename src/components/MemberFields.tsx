"use client";

import { AVATAR_EMOJIS, type CostumeId } from "@/lib/types";
import PinInput from "./PinInput";

export type MemberDraft = {
  name: string;
  pin: string;
  photo?: string;
  emoji: string;
  costume?: CostumeId;
};

export const emptyMember = (): MemberDraft => ({
  name: "",
  pin: "",
  emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
  costume: "sueter",
});

export const dataValid = (m: MemberDraft) => m.pin.length === 4;

/** El nombre va en el paso de la foto; aquí solo el PIN. */
export default function DataFields({ value, onChange }: { value: MemberDraft; onChange: (m: MemberDraft) => void }) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3">
        <span className="text-center text-snow/80">Inventa un PIN de 4 números</span>
        <PinInput value={value.pin} onChange={(pin) => onChange({ ...value, pin })} />
      </div>
      <div className="glass flex flex-col gap-2 rounded-2xl p-4 text-sm text-snow/70">
        <p>🔐 Para entrar desde otro teléfono solo tocas tu foto en el grupo y pones este PIN.</p>
        <p>🤫 No se lo digas a nadie, ¡así nadie ve quién te tocó!</p>
      </div>
    </div>
  );
}
