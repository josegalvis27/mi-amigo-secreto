"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import StepShell from "@/components/StepShell";
import NameAndLook from "@/components/NameAndLook";
import DataFields, { dataValid, emptyMember } from "@/components/MemberFields";
import ShareInvite from "@/components/ShareInvite";
import { createGroup } from "@/lib/api";

const GROUP_EMOJIS = ["🎄", "🎁", "🫔", "⭐", "🏢", "👨‍👩‍👧", "🎉", "🏖️"];
const BUDGETS: (number | null)[] = [5, 10, 20, 30, 50, null];

export default function CrearForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎄");
  const [budget, setBudget] = useState<number | null>(10);
  const [date, setDate] = useState(`${new Date().getFullYear()}-12-20`);
  const [admin, setAdmin] = useState(emptyMember);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError("");
    try {
      setCode(await createGroup({ name, emoji, budget, date, admin }));
      setStep(3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const next = (label: string, disabled: boolean, onClick = () => setStep(step + 1)) => (
    <>
      {error && <p className="mb-2 rounded-xl bg-berry/20 p-2 text-center text-sm">{error}</p>}
      <button
        disabled={disabled}
        onClick={onClick}
        className="btn-primary w-full rounded-2xl py-4 text-lg font-semibold transition disabled:opacity-40 active:scale-[0.97]"
      >
        {label}
      </button>
    </>
  );
  const back = () => (step === 0 ? router.push("/") : setStep(step - 1));

  if (step === 3 && code) {
    return (
      <main className="mx-auto flex h-dvh w-full max-w-md flex-col items-center justify-center px-5 text-center">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10 }} className="text-7xl">
          {emoji}
        </motion.div>
        <h1 className="mt-3 font-xmas text-4xl font-bold">¡Grupo creado!</h1>
        <p className="mt-1 text-snow/70">
          Ahora invita a tus panas a <b className="text-snow">{name}</b>
        </p>
        <ShareInvite code={code} groupName={name} />
        <Link href={`/g/${code}`} className="glass mt-3 w-full rounded-2xl py-4 font-medium">
          Ir a mi grupo →
        </Link>
      </main>
    );
  }

  if (step === 0)
    return (
      <StepShell step={0} total={3} onBack={back} title="Arma tu grupo" subtitle="Nombre, presupuesto y fecha." footer={next("Siguiente →", name.trim().length < 2 || !date)}>
        <div className="flex flex-col gap-5">
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre: Los Panas de la Ofi" maxLength={32} />
          <div className="grid grid-cols-8 gap-1.5">
            {GROUP_EMOJIS.map((e) => (
              <motion.button
                whileTap={{ scale: 0.85 }}
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`aspect-square rounded-xl text-xl transition ${emoji === e ? "bg-gold/25 ring-2 ring-gold" : "bg-white/5"}`}
              >
                {e}
              </motion.button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-snow/70">💵 Presupuesto por regalo</span>
            <div className="grid grid-cols-3 gap-2">
              {BUDGETS.map((b) => (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  key={String(b)}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`rounded-2xl py-2.5 font-semibold transition ${budget === b ? "btn-gold" : "glass"}`}
                >
                  {b === null ? "Libre" : `$${b}`}
                </motion.button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-snow/70">📅 Día del intercambio</span>
            <input type="date" className="field [color-scheme:dark]" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
      </StepShell>
    );

  if (step === 1)
    return (
      <StepShell step={1} total={3} onBack={back} title="¿Y tú quién eres?" subtitle="Tú también entras en el sorteo 😉" footer={next("Siguiente →", admin.name.trim().length < 2)}>
        <NameAndLook value={admin} onChange={setAdmin} />
      </StepShell>
    );

  return (
    <StepShell step={2} total={3} onBack={back} title="Para no perder nada 🔐" subtitle="Solo tu número y un PIN" footer={next(saving ? "Creando… ✨" : "🎉 Crear grupo", !dataValid(admin) || saving, submit)}>
      <DataFields value={admin} onChange={setAdmin} />
    </StepShell>
  );
}
