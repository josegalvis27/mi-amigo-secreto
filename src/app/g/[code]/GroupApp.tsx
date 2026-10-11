"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  addWish,
  drawGroup,
  finishLetter,
  joinGroup,
  login,
  logout,
  markRevealed,
  removeWish,
  updateMember,
  useStore,
  type Group,
  type Member,
} from "@/lib/store";
import Lights from "@/components/Lights";
import Polaroid from "@/components/Polaroid";
import Countdown from "@/components/Countdown";
import Sheet from "@/components/Sheet";
import ShareInvite from "@/components/ShareInvite";
import WishLetter from "@/components/WishLetter";
import GiftReveal from "@/components/GiftReveal";
import { GiftBox, GiftLid } from "@/components/Gift";
import DataFields, { dataValid, emptyMember } from "@/components/MemberFields";
import PinInput from "@/components/PinInput";
import StepShell from "@/components/StepShell";
import NameAndLook from "@/components/NameAndLook";
import LetterStep from "@/components/LetterStep";
import type { WishDraft } from "@/lib/ideas";
import LookPicker from "@/components/LookPicker";
import ShareCardSheet from "@/components/ShareCard";

type Tab = "grupo" | "lista" | "amigo";
const ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4];

export default function GroupApp() {
  const { code: raw } = useParams<{ code: string }>();
  const code = raw.toUpperCase();
  const store = useStore();

  if (!store) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="animate-bounce text-5xl">🎁</span>
      </div>
    );
  }

  const group = store.groups[code];
  if (!group) return <NotFound code={code} />;

  const me = group.members.find((m) => m.id === store.sessions[code]);
  if (!me) return <AuthView group={group} />;

  return <Dashboard group={group} me={me} />;
}

// ---------------- sin grupo ----------------

function NotFound({ code }: { code: string }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl">🦌💨</div>
      <h1 className="mt-6 font-xmas text-4xl font-bold">No encontramos ese grupo</h1>
      <p className="mt-2 text-snow/60">
        Revisa el código <b className="font-mono text-gold">{code}</b>. En esta versión de prueba los grupos solo viven en el
        teléfono donde se crearon.
      </p>
      <Link href="/" className="btn-primary mt-8 w-full rounded-2xl py-4 font-semibold">
        Volver al inicio
      </Link>
    </main>
  );
}

// ---------------- entrar / unirse ----------------

function AuthView({ group }: { group: Group }) {
  const [step, setStep] = useState(0);
  const [login, setLogin] = useState(false);
  const [draft, setDraft] = useState(emptyMember);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    setError("");
    try {
      await joinGroup(group.code, draft);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (login) return <LoginView group={group} onBack={() => setLogin(false)} />;
  if (step === 0) return <InviteView group={group} onJoin={() => setStep(1)} onLogin={() => setLogin(true)} />;

  const back = () => setStep(step - 1);
  const btn = (label: string, disabled: boolean, onClick = () => setStep(step + 1)) => (
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

  if (step === 1)
    return (
      <StepShell step={0} total={3} onBack={back} title="Ponte navideño 🎄" subtitle="Tu foto con disfraz o un avatar" footer={btn("Siguiente →", draft.name.trim().length < 2)}>
        <NameAndLook value={draft} onChange={setDraft} />
      </StepShell>
    );

  return (
    <StepShell step={1} total={3} onBack={back} title="Para no perder nada 🔐" subtitle="Solo tu número y un PIN" footer={btn(busy ? "Entrando… ✨" : "🎄 ¡Me anoto!", !dataValid(draft) || busy, join)}>
      <DataFields value={draft} onChange={setDraft} />
    </StepShell>
  );
}

function InviteView({ group, onJoin, onLogin }: { group: Group; onJoin: () => void; onLogin: () => void }) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <Lights />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-sm text-snow/60">Te invitaron al amigo secreto</p>
        <h1 className="mt-1 font-xmas text-[2.6rem] font-bold leading-tight">
          {group.emoji} {group.name}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-full bg-gold/15 px-3 py-1 text-gold">💵 {group.budget === null ? "Sin límite" : `Hasta $${group.budget}`}</span>
          <span className="rounded-full bg-white/8 px-3 py-1">
            📅 {new Date(`${group.date}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "long" })}
          </span>
        </div>
        <div className="relative mt-8 flex h-40 w-full items-center justify-center">
          {group.members.slice(0, 5).map((m, i, arr) => {
            const offset = i - (arr.length - 1) / 2;
            return (
              <motion.div
                key={m.id}
                className="absolute"
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: Math.abs(offset) * 8, x: offset * (arr.length > 3 ? 58 : 80), rotate: offset * 7 }}
                transition={{ type: "spring", damping: 14, delay: 0.2 + i * 0.08 }}
                style={{ zIndex: 10 - Math.abs(offset) }}
              >
                <Polaroid member={m} size="sm" />
              </motion.div>
            );
          })}
        </div>
        <p className="mt-6 text-snow/70">
          {group.assignments
            ? "🎲 El sorteo ya se hizo"
            : `${group.members.length} ${group.members.length === 1 ? "persona ya está" : "personas ya están"} adentro. ¡Falta tú!`}
        </p>
      </div>
      <div className="safe-bottom flex flex-col gap-2 px-5">
        {group.assignments ? (
          <p className="glass rounded-2xl p-4 text-center text-sm">Si quieres entrar, pídele al organizador que repita el sorteo.</p>
        ) : (
          <button onClick={onJoin} className="btn-primary w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.97]">
            🙋 ¡Me anoto!
          </button>
        )}
        <button onClick={onLogin} className="py-3 text-sm text-gold">
          Ya estoy en el grupo, entrar con mi PIN
        </button>
      </div>
    </main>
  );
}

function LoginView({ group, onBack }: { group: Group; onBack: () => void }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await login(group.code, phone, pin);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <StepShell
      step={0}
      total={1}
      onBack={onBack}
      title="¡Qué bueno verte! 👋"
      subtitle={`Entra a ${group.name}`}
      footer={
        <>
          {error && (
            <motion.p animate={{ x: [10, -8, 6, 0] }} className="mb-2 rounded-xl bg-berry/20 p-2 text-center text-sm">
              {error}
            </motion.p>
          )}
          <button
            disabled={pin.length !== 4 || phone.replace(/\D/g, "").length < 10 || busy}
            onClick={submit}
            className="btn-primary w-full rounded-2xl py-4 text-lg font-semibold transition disabled:opacity-40 active:scale-[0.97]"
          >
            Entrar 🔑
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-snow/70">Tu WhatsApp</span>
          <input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0414 123 4567" inputMode="tel" />
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-snow/70">Tu PIN</span>
          <PinInput value={pin} onChange={setPin} />
        </div>
      </div>
    </StepShell>
  );
}

// ---------------- dentro del grupo ----------------

function Dashboard({ group, me }: { group: Group; me: Member }) {
  if (me.letterDone === false) return <LetterOnboarding group={group} me={me} />;
  return <DashboardTabs group={group} me={me} />;
}

/** Primer paso al entrar al grupo: armar la carta según el presupuesto. */
function LetterOnboarding({ group, me }: { group: Group; me: Member }) {
  const [wishes, setWishes] = useState<WishDraft[]>([]);
  return (
    <StepShell
      step={2}
      total={3}
      title={`¡Ya estás adentro, ${me.name}! 💌`}
      subtitle={group.budget === null ? "Ahora arma tu carta: pide lo que quieras" : `Ahora arma tu carta con ideas que caben en $${group.budget}`}
      footer={
        <button
          onClick={() => {
            navigator.vibrate?.(20);
            finishLetter(group.code, me.id, wishes);
          }}
          className="btn-primary w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.97]"
        >
          {wishes.length ? `Listo, enviar mi carta (${wishes.length}) ✨` : "Saltar por ahora →"}
        </button>
      }
    >
      <LetterStep budget={group.budget} wishes={wishes} onChange={setWishes} />
    </StepShell>
  );
}

function DashboardTabs({ group, me }: { group: Group; me: Member }) {
  const [tab, setTab] = useState<Tab>(group.assignments && !group.revealed[me.id] ? "amigo" : "grupo");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-x-hidden pb-28">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.22 }}
          className="flex flex-1 flex-col"
        >
          {tab === "grupo" && <GroupTab group={group} me={me} goTo={setTab} />}
          {tab === "lista" && <ListTab group={group} me={me} />}
          {tab === "amigo" && <FriendTab group={group} me={me} />}
        </motion.div>
      </AnimatePresence>
      <BottomNav tab={tab} onChange={setTab} badge={!!group.assignments && !group.revealed[me.id]} />
    </main>
  );
}

function BottomNav({ tab, onChange, badge }: { tab: Tab; onChange: (t: Tab) => void; badge: boolean }) {
  const items: { id: Tab; icon: string; label: string }[] = [
    { id: "grupo", icon: "🎄", label: "Grupo" },
    { id: "lista", icon: "💌", label: "Mi carta" },
    { id: "amigo", icon: "🎁", label: "Mi amigo" },
  ];
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4">
      <div className="glass grid grid-cols-3 rounded-[1.75rem] bg-night/70 p-1.5 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.6)]">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => {
                navigator.vibrate?.(10);
                onChange(it.id);
              }}
              className="relative flex flex-col items-center gap-0.5 py-2"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[1.4rem] bg-white/12"
                  transition={{ type: "spring", damping: 25, stiffness: 320 }}
                />
              )}
              <motion.span animate={{ scale: active ? 1.2 : 1, y: active ? -2 : 0 }} className="relative text-2xl">
                {it.icon}
                {it.id === "amigo" && badge && (
                  <span className="absolute -right-1 -top-0.5 h-3 w-3 animate-ping rounded-full bg-berry-2" />
                )}
              </motion.span>
              <span className={`relative text-xs ${active ? "text-snow" : "text-snow/50"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Avatar({ member, className = "" }: { member: Member; className?: string }) {
  return member.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={member.photo} alt={member.name} className={`rounded-full object-cover ${className}`} />
  ) : (
    <span className={`flex items-center justify-center rounded-full bg-pine text-lg ${className}`}>{member.emoji}</span>
  );
}

// ---------- tab: grupo ----------

function GroupTab({ group, me, goTo }: { group: Group; me: Member; goTo: (t: Tab) => void }) {
  const [viewing, setViewing] = useState<Member | null>(null);
  const [inviting, setInviting] = useState(false);
  const [confirmDraw, setConfirmDraw] = useState(false);
  const isAdmin = group.adminId === me.id;
  const revealedCount = Object.keys(group.revealed).length;

  return (
    <>
      <Lights />
      <header className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-snow/60">Hola, {me.name} 👋</p>
            <h1 className="mt-0.5 truncate font-xmas text-[2rem] font-bold leading-tight">
              {group.emoji} {group.name}
            </h1>
          </div>
          <button onClick={() => logout(group.code)} className="glass mt-1 shrink-0 rounded-full px-3 py-1.5 text-xs text-snow/70">
            Salir
          </button>
        </div>
        <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto whitespace-nowrap px-5 text-sm [scrollbar-width:none]">
          <span className="rounded-full bg-gold/15 px-3 py-1 text-gold">
            💵 {group.budget === null ? "Sin límite" : `Hasta $${group.budget}`}
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1">
            📅 {new Date(`${group.date}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "long" })}
          </span>
          <button onClick={() => setInviting(true)} className="rounded-full bg-white/8 px-3 py-1 font-mono tracking-wider">
            🔑 {group.code}
          </button>
        </div>
      </header>

      <section className="mt-3 px-5">
        <Countdown date={group.date} />
      </section>

      {group.assignments ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => goTo("amigo")}
          className="mx-5 mt-3 flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-berry to-[#b3123a] p-4 text-left shadow-[0_15px_40px_-10px_rgba(232,48,79,0.7)]"
        >
          <motion.span animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-4xl">
            🎁
          </motion.span>
          <div>
            <p className="font-semibold">¡El sorteo ya se hizo!</p>
            <p className="text-sm text-snow/80">
              {group.revealed[me.id] ? `${revealedCount}/${group.members.length} ya saben a quién les tocó` : "Toca aquí para descubrir a quién le regalas →"}
            </p>
          </div>
        </motion.button>
      ) : (
        isAdmin && (
          <div className="mx-5 mt-3 flex items-center gap-3 rounded-3xl border border-gold/30 bg-gold/10 p-3">
            <p className="min-w-0 flex-1 text-sm leading-snug text-snow/80">
              <b className="text-snow">👑 Organizas tú.</b>{" "}
              {group.members.length < 3 ? `Faltan ${3 - group.members.length} para sortear.` : "Sortea cuando estén todos."}
            </p>
            <button
              disabled={group.members.length < 3}
              onClick={() => setConfirmDraw(true)}
              className="btn-gold shrink-0 rounded-2xl px-4 py-2.5 font-semibold transition disabled:opacity-40 active:scale-[0.97]"
            >
              🎲 Sortear
            </button>
          </div>
        )
      )}

      <section className="mt-5 px-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Los panas <span className="text-snow/50">({group.members.length})</span>
          </h2>
          {!group.assignments && (
            <button onClick={() => setInviting(true)} className="text-sm font-medium text-gold">
              + Invitar
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-x-5 gap-y-7 pt-2">
          {group.members.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: ROTATIONS[i % ROTATIONS.length] }}
              transition={{ delay: i * 0.05, type: "spring", damping: 14 }}
              whileTap={{ scale: 0.92, rotate: 0 }}
              onClick={() => setViewing(m)}
              className="relative flex flex-col items-center"
            >
              <Polaroid member={m} size="sm" caption={m.id === me.id ? "Tú" : m.name} width="w-full" />
              <span className="absolute -bottom-2 right-0 rounded-full bg-berry px-1.5 text-xs font-semibold">
                {m.wishes.length} 💌
              </span>
            </motion.button>
          ))}
          {!group.assignments && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setInviting(true)}
              className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-white/20 text-snow/50"
            >
              <span className="text-3xl">＋</span>
              <span className="text-xs">Invitar</span>
            </motion.button>
          )}
        </div>
      </section>

      <Sheet open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="pb-4">
            <WishLetter member={viewing} budget={group.budget} />
          </div>
        )}
      </Sheet>

      <Sheet open={inviting} onClose={() => setInviting(false)}>
        <div className="pb-6 text-center">
          <h3 className="font-xmas text-3xl font-bold">Invita a tus panas 🎉</h3>
          <ShareInvite code={group.code} groupName={group.name} />
        </div>
      </Sheet>

      <Sheet open={confirmDraw} onClose={() => setConfirmDraw(false)}>
        <div className="flex flex-col items-center pb-6 text-center">
          <div className="flex flex-col items-center">
            <GiftLid size={80} />
            <GiftBox size={80} />
          </div>
          <h3 className="mt-5 font-xmas text-3xl font-bold">¿Listos para el sorteo?</h3>
          <p className="mt-2 text-snow/70">
            Van a participar <b>{group.members.length} personas</b>. Después del sorteo ya nadie más puede entrar.
          </p>
          <div className="mt-4 flex -space-x-2">
            {group.members.map((m) => (
              <Avatar key={m.id} member={m} className="h-9 w-9 ring-2 ring-night-2" />
            ))}
          </div>
          <button
            onClick={() => {
              drawGroup(group.code);
              setConfirmDraw(false);
              navigator.vibrate?.([30, 50, 30]);
              goTo("amigo");
            }}
            className="btn-primary mt-6 w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.97]"
          >
            🎲 ¡Sortear ya!
          </button>
        </div>
      </Sheet>
    </>
  );
}

// ---------- tab: mi carta ----------

function ListTab({ group, me }: { group: Group; me: Member }) {
  const [sharing, setSharing] = useState(false);
  const [editingLook, setEditingLook] = useState(false);

  return (
    <div className="px-5 pt-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-xmas text-4xl font-bold">Mi carta</h1>
          <p className="text-sm text-snow/60">Para que tu amigo secreto no falle 😉</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setSharing(true)}
          className="btn-gold shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold"
        >
          📤 Compartir
        </motion.button>
      </div>
      <WishLetter
        member={me}
        budget={group.budget}
        editable
        onAdd={(w) => addWish(group.code, me.id, w)}
        onRemove={(id) => removeWish(group.code, me.id, id)}
        onEditLook={() => setEditingLook(true)}
      />
      <p className="mt-4 text-center text-xs text-snow/40">Toca tu foto para cambiarla o ponerte otro disfraz 🎅</p>
      <ShareCardSheet open={sharing} onClose={() => setSharing(false)} member={me} group={group} />
      <Sheet open={editingLook} onClose={() => setEditingLook(false)}>
        <div className="flex flex-col gap-4 pb-6">
          <h3 className="text-center font-xmas text-3xl font-bold">Tu look navideño</h3>
          <LookPicker value={me} onChange={(patch) => updateMember(group.code, me.id, patch)} />
          <button onClick={() => setEditingLook(false)} className="btn-primary rounded-2xl py-4 font-semibold active:scale-[0.97]">
            ¡Listo! ✨
          </button>
        </div>
      </Sheet>
    </div>
  );
}

// ---------- tab: mi amigo ----------

function FriendTab({ group, me }: { group: Group; me: Member }) {
  const receiverId = group.assignments?.[me.id];
  const receiver = group.members.find((m) => m.id === receiverId);
  const [revealed, setRevealed] = useState(!!group.revealed[me.id]);

  if (!group.assignments || !receiver) {
    const isAdmin = group.adminId === me.id;
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          <motion.div animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity }} className="flex flex-col items-center">
            <GiftLid size={130} color="#0e4d3a" />
            <GiftBox size={130} color="#0e4d3a" />
          </motion.div>
          {["z", "z", "Z"].map((z, i) => (
            <motion.span
              key={i}
              className="absolute -right-4 top-0 font-xmas text-3xl font-bold text-gold"
              animate={{ opacity: [0, 1, 0], x: [0, 20 + i * 8], y: [0, -40 - i * 15] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8 }}
            >
              {z}
            </motion.span>
          ))}
        </div>
        <h1 className="mt-10 font-xmas text-4xl font-bold">El regalo está durmiendo…</h1>
        <p className="mt-2 text-snow/60">
          {isAdmin
            ? "Cuando estén todos, ve a la pestaña Grupo y haz el sorteo."
            : "Cuando quien organiza haga el sorteo, aquí vas a descubrir a quién le regalas."}
        </p>
        <p className="mt-6 rounded-2xl bg-white/5 px-4 py-3 text-sm text-snow/70">
          Mientras tanto, llena tu carta 💌 para ponérsela fácil a tu amigo secreto.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6">
      <GiftReveal
        receiver={receiver}
        alreadyRevealed={!!group.revealed[me.id]}
        onRevealed={() => {
          setTimeout(() => setRevealed(true), 1200);
          markRevealed(group.code, me.id);
        }}
      />
      <AnimatePresence>
        {revealed && (
          <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 20 }} className="mt-4">
            <p className="mb-3 text-center text-sm text-snow/60">👇 Esto es lo que pidió</p>
            <WishLetter member={receiver} budget={group.budget} />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
