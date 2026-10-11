"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import TopBar from "@/components/TopBar";
import MemberFields, { emptyMember, memberValid } from "@/components/MemberFields";
import ShareInvite from "@/components/ShareInvite";
import { createGroup } from "@/lib/store";

const GROUP_EMOJIS = ["🎄", "🎁", "🫔", "⭐", "🏢", "👨‍👩‍👧", "🎉", "🏖️"];
const BUDGETS: (number | null)[] = [5, 10, 20, 30, 50, null];

export default function CrearForm() {
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
      const c = await createGroup({ name, emoji, budget, date, admin });
      setCode(c);
      setStep(2);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      {step === 0 && <TopBar />}
      {step === 1 && (
        <div className="px-4 pt-3">
          <button onClick={() => setStep(0)} className="glass flex h-10 w-10 items-center justify-center rounded-full text-lg" aria-label="Volver">
            ←
          </button>
        </div>
      )}
      {step < 2 && (
        <div className="mt-4 flex gap-2 px-5">
          {[0, 1].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-gold" : "bg-white/15"}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="flex flex-1 flex-col px-5 pb-8 pt-6"
        >
          {step === 0 && (
            <>
              <h1 className="font-xmas text-4xl font-bold">Arma tu grupo</h1>
              <p className="mt-1 text-snow/60">Ponle nombre, presupuesto y fecha.</p>

              <div className="mt-6 flex flex-col gap-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-snow/70">Nombre del grupo</span>
                  <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Los Panas de la Ofi" maxLength={32} />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-snow/70">Escoge un ícono</span>
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
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-snow/70">Presupuesto por regalo</span>
                  <div className="grid grid-cols-3 gap-2">
                    {BUDGETS.map((b) => (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        key={String(b)}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`rounded-2xl py-3 font-semibold transition ${budget === b ? "btn-gold" : "glass"}`}
                      >
                        {b === null ? "Sin límite" : `$${b}`}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-snow/70">Día del intercambio</span>
                  <input type="date" className="field [color-scheme:dark]" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
              </div>

              <button
                disabled={name.trim().length < 2 || !date}
                onClick={() => setStep(1)}
                className="btn-primary mt-8 rounded-2xl py-4 text-lg font-semibold transition disabled:opacity-40 active:scale-[0.97]"
              >
                Siguiente →
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-xmas text-4xl font-bold">¿Y tú quién eres?</h1>
              <p className="mt-1 mb-6 text-snow/60">Tú también entras en el sorteo, organizador.</p>
              <MemberFields value={admin} onChange={setAdmin} />
              {error && <p className="mt-4 rounded-xl bg-berry/20 p-3 text-center text-sm">{error}</p>}
              <button
                disabled={!memberValid(admin) || saving}
                onClick={submit}
                className="btn-primary mt-8 rounded-2xl py-4 text-lg font-semibold transition disabled:opacity-40 active:scale-[0.97]"
              >
                {saving ? "Creando… ✨" : "🎉 Crear grupo"}
              </button>
            </>
          )}

          {step === 2 && code && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10 }}
                className="text-7xl"
              >
                {emoji}
              </motion.div>
              <h1 className="mt-4 font-xmas text-4xl font-bold">¡Grupo creado!</h1>
              <p className="mt-2 text-snow/70">Ahora invita a tus panas a <b className="text-snow">{name}</b></p>
              <ShareInvite code={code} groupName={name} />
              <Link href={`/g/${code}`} className="glass mt-4 w-full rounded-2xl py-4 font-medium">
                Ir a mi grupo →
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
