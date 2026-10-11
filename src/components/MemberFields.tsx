"use client";

import { AVATAR_EMOJIS } from "@/lib/store";
import PhotoPicker from "./PhotoPicker";
import PinInput from "./PinInput";

export type MemberDraft = { name: string; phone: string; pin: string; photo?: string; emoji: string };

export const emptyMember = (): MemberDraft => ({
  name: "",
  phone: "",
  pin: "",
  emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
});

export const memberValid = (m: MemberDraft) =>
  m.name.trim().length >= 2 && m.phone.replace(/\D/g, "").length >= 10 && m.pin.length === 4;

export default function MemberFields({ value, onChange }: { value: MemberDraft; onChange: (m: MemberDraft) => void }) {
  const set = (patch: Partial<MemberDraft>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-5">
      <PhotoPicker name={value.name} emoji={value.emoji} photo={value.photo} onChange={(photo) => set({ photo })} />

      {!value.photo && (
        <div className="flex justify-center gap-1.5">
          {AVATAR_EMOJIS.slice(0, 7).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => set({ emoji: e })}
              className={`h-10 w-10 rounded-full text-xl transition ${value.emoji === e ? "bg-gold/25 ring-2 ring-gold" : "bg-white/5"}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-snow/70">¿Cómo te dicen?</span>
        <input className="field" value={value.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej: La Gocha, Chuo, Mari…" maxLength={24} />
      </label>

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
        <p className="text-center text-xs text-snow/50">Con tu número + PIN entras desde cualquier teléfono 🔐</p>
      </div>
    </div>
  );
}
