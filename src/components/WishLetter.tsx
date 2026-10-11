"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Member, Wish } from "@/lib/store";
import { compressPhoto } from "@/lib/image";
import Polaroid from "./Polaroid";
import Sheet from "./Sheet";

const WISH_EMOJIS = ["🎁", "🎧", "📚", "🍫", "👕", "👟", "💄", "🎮", "🪴", "☕", "🧦", "🍷", "🎲", "✨"];
const IDEAS: Omit<Wish, "id">[] = [
  { title: "Chocolates", emoji: "🍫", price: 5 },
  { title: "Una franela", emoji: "👕", price: 15 },
  { title: "Un libro", emoji: "📚", price: 10 },
  { title: "Medias navideñas", emoji: "🧦", price: 5 },
  { title: "Un perfume", emoji: "✨", price: 25 },
];

type Props = {
  member: Member;
  budget: number | null;
  editable?: boolean;
  onAdd?: (w: Omit<Wish, "id">) => void;
  onRemove?: (id: string) => void;
  onPhoto?: (photo: string) => void;
};

/** La "Carta al Niño Jesús": foto + lista de deseos en papel. */
export default function WishLetter({ member, budget, editable, onAdd, onRemove, onPhoto }: Props) {
  const [adding, setAdding] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-[1.75rem] px-5 pb-6 pt-5 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0 39px, rgba(14,77,58,0.12) 39px 40px), linear-gradient(180deg, #fffaf0, #f7eedb)",
        }}
      >
        {/* borde de bastón de caramelo */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-2.5"
          style={{ background: "repeating-linear-gradient(45deg, #e8304f 0 10px, #fff 10px 20px)" }}
        />

        <div className="flex items-start gap-4 pt-2">
          <button
            type="button"
            disabled={!editable}
            onClick={() => fileRef.current?.click()}
            className="shrink-0 transition active:scale-95"
            aria-label={editable ? "Cambiar foto" : undefined}
          >
            <Polaroid member={member} size="sm" rotate={-6} />
          </button>
          {editable && (
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) onPhoto?.(await compressPhoto(f));
              }}
            />
          )}
          <div className="min-w-0 pt-1">
            <p className="font-hand text-lg leading-none text-pine/80">Querido Niño Jesús,</p>
            <h2 className="mt-1 font-xmas text-3xl font-bold leading-tight text-berry">
              {editable ? "Este año quiero…" : `${member.name} quiere…`}
            </h2>
            {budget !== null && (
              <span className="mt-2 inline-block rounded-full bg-pine px-2.5 py-0.5 text-xs font-medium text-snow">
                Presupuesto: ${budget}
              </span>
            )}
          </div>
        </div>

        <ul className="mt-5 flex flex-col">
          <AnimatePresence initial={false}>
            {member.wishes.map((w, i) => (
              <motion.li
                key={w.id}
                layout
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60, height: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 border-b border-dashed border-pine/20 py-3 last:border-0"
              >
                <span className="text-2xl leading-none">{w.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-hand text-2xl leading-6">{w.title}</p>
                  {(w.price || w.note) && (
                    <p className="mt-0.5 text-sm text-ink/60">
                      {w.price ? <b className="text-pine">~${w.price}</b> : null}
                      {w.price && w.note ? " · " : ""}
                      {w.note}
                    </p>
                  )}
                  {w.link && (
                    <a href={w.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-medium text-berry underline">
                      Ver dónde comprarlo ↗
                    </a>
                  )}
                </div>
                {editable && (
                  <button
                    onClick={() => onRemove?.(w.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/50 active:scale-90"
                    aria-label={`Quitar ${w.title}`}
                  >
                    ✕
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {member.wishes.length === 0 && (
          <p className="py-6 text-center font-hand text-2xl text-ink/40">
            {editable ? "Tu carta está vacía… ¡pide algo! ✍️" : "Todavía no ha pedido nada 🤔"}
          </p>
        )}

        {editable && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setAdding(true)}
            className="mt-3 w-full rounded-2xl border-2 border-dashed border-berry/40 py-3 font-semibold text-berry"
          >
            + Agregar un deseo
          </motion.button>
        )}

        <p className="mt-4 text-right font-hand text-xl text-ink/60">Con cariño, {member.name} 💌</p>
      </div>

      {editable && (
        <AddWishSheet
          open={adding}
          onClose={() => setAdding(false)}
          onAdd={(w) => {
            onAdd?.(w);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function AddWishSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (w: Omit<Wish, "id">) => void }) {
  const [emoji, setEmoji] = useState("🎁");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");

  function submit(w: Omit<Wish, "id">) {
    onAdd(w);
    setEmoji("🎁");
    setTitle("");
    setPrice("");
    setLink("");
    setNote("");
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="font-xmas text-3xl font-bold">Nuevo deseo ✨</h3>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {IDEAS.map((idea) => (
          <button
            key={idea.title}
            onClick={() => submit(idea)}
            className="glass shrink-0 rounded-full px-3 py-1.5 text-sm"
          >
            {idea.emoji} {idea.title}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex flex-col gap-4 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          submit({
            emoji,
            title: title.trim(),
            price: price ? Number(price) : undefined,
            link: link.trim() ? (/^https?:\/\//.test(link.trim()) ? link.trim() : `https://${link.trim()}`) : undefined,
            note: note.trim() || undefined,
          });
        }}
      >
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {WISH_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`h-11 w-11 shrink-0 rounded-xl text-xl transition ${emoji === e ? "bg-gold/25 ring-2 ring-gold" : "bg-white/5"}`}
            >
              {e}
            </button>
          ))}
        </div>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué quieres?" maxLength={60} />
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <input className="field" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} placeholder="$ aprox" inputMode="decimal" />
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Talla, color…" maxLength={60} />
        </div>
        <input className="field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (opcional)" inputMode="url" />
        <button disabled={!title.trim()} className="btn-primary rounded-2xl py-4 font-semibold transition disabled:opacity-40 active:scale-[0.97]">
          Agregar a mi carta 💌
        </button>
      </form>
    </Sheet>
  );
}
