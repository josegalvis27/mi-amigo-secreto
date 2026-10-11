"use client";

import LookPicker from "./LookPicker";
import type { MemberDraft } from "./MemberFields";

export default function NameAndLook({ value, onChange }: { value: MemberDraft; onChange: (m: MemberDraft) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <input
        className="field text-center"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Tu nombre o apodo"
        maxLength={24}
      />
      <LookPicker value={value} onChange={(patch) => onChange({ ...value, ...patch })} />
    </div>
  );
}
