"use client";

import { useEffect, useRef, useState } from "react";
import { domToBlob } from "modern-screenshot";
import type { Group, Member } from "@/lib/store";
import Polaroid from "./Polaroid";
import Sheet from "./Sheet";

const W = 360;
const H = 640;
const MAX_WISHES = 5;
const LIGHTS = ["#ff5d73", "#ffc94a", "#4ade80", "#60a5fa", "#f472b6"];

/** Tarjeta 9:16 (1080x1920 al exportar) para historias de WhatsApp/Instagram. */
function Card({ member, group }: { member: Member; group: Group }) {
  const wishes = member.wishes.slice(0, MAX_WISHES);
  const extra = member.wishes.length - wishes.length;
  return (
    <div
      className="relative flex flex-col items-center overflow-hidden font-sans text-snow"
      style={{
        width: W,
        height: H,
        background:
          "radial-gradient(120% 60% at 50% -10%, #2a1f5c 0%, transparent 60%), radial-gradient(80% 50% at 100% 100%, rgba(14,77,58,0.7) 0%, transparent 70%), radial-gradient(70% 40% at 0% 80%, rgba(232,48,79,0.35) 0%, transparent 70%), #0a0f24",
      }}
    >
      {/* nieve fija */}
      {Array.from({ length: 40 }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: (i * 97) % W, top: (i * 151) % H, width: 2 + (i % 3), height: 2 + (i % 3), opacity: 0.25 + (i % 4) * 0.12 }}
        />
      ))}
      {/* bombillos */}
      <div className="absolute inset-x-0 top-0 flex justify-around px-2">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="mt-2 h-4 w-2.5 rounded-b-full"
            style={{ background: LIGHTS[i % LIGHTS.length], boxShadow: `0 0 10px 3px ${LIGHTS[i % LIGHTS.length]}`, marginTop: 6 + (i % 2) * 6 }}
          />
        ))}
      </div>

      <h1 className="mt-10 text-center font-xmas text-[2.6rem] font-bold leading-[0.9]">
        <span className="text-gold">Mi Amigo</span> <span className="text-berry-2">Secreto</span>
      </h1>
      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-snow/60">
        {group.emoji} {group.name}
      </p>

      <div className="flex-1" />
      <div className="relative">
        <Polaroid member={member} size="md" rotate={-4} />
        <span className="absolute -left-8 top-6 text-3xl" style={{ transform: "rotate(-15deg)" }}>🎄</span>
        <span className="absolute -right-8 bottom-10 text-3xl" style={{ transform: "rotate(12deg)" }}>🎁</span>
      </div>

      <div
        className="relative mx-6 mt-5 self-stretch rounded-[1.5rem] px-4 pb-3 pt-5 text-ink"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0 33px, rgba(14,77,58,0.12) 33px 34px), linear-gradient(180deg, #fffaf0, #f7eedb)",
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-2.5 rounded-t-[1.5rem]"
          style={{ background: "repeating-linear-gradient(45deg, #e8304f 0 10px, #fff 10px 20px)" }}
        />
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-hand text-base leading-none text-pine/80">Querido Niño Jesús,</p>
            <p className="mt-1 truncate font-xmas text-[1.6rem] font-bold leading-none text-berry">{member.name} quiere…</p>
          </div>
          {group.budget !== null && (
            <span className="shrink-0 rounded-full bg-pine px-2.5 py-0.5 text-[11px] font-medium text-snow">Hasta ${group.budget}</span>
          )}
        </div>
        <ul className="mt-2">
          {wishes.map((w) => (
            <li key={w.id} className="flex items-center gap-2 font-hand text-[1.4rem] leading-[34px]">
              <span className="text-lg">{w.emoji}</span>
              <span className="flex-1 truncate">{w.title}</span>
              {w.price ? <span className="font-sans text-xs font-semibold text-pine">~${w.price}</span> : null}
            </li>
          ))}
          {extra > 0 && <li className="font-hand text-lg text-ink/50">…y {extra} cosa{extra > 1 ? "s" : ""} más</li>}
          {wishes.length === 0 && <li className="font-hand text-xl leading-[34px] text-ink/40">¡Sorpréndeme! 🎁</li>}
        </ul>
      </div>

      <div className="flex-1" />
      <div className="mb-5 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs">
        <span>🎁 Arma el tuyo en</span>
        <b className="text-gold">{typeof window === "undefined" ? "" : window.location.host}</b>
      </div>
    </div>
  );
}

export default function ShareCardSheet({ open, onClose, member, group }: { open: boolean; onClose: () => void; member: Member; group: Group }) {
  const ref = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<{ url: string; file: File } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let url = "";
    (async () => {
      setImg(null);
      setError("");
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 250));
      try {
        const blob = await domToBlob(ref.current!, { scale: 3, type: "image/png" });
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImg({ url, file: new File([blob], `mi-carta-${member.name}.png`, { type: "image/png" }) });
      } catch {
        if (!cancelled) setError("No se pudo crear la imagen. Intenta otra vez.");
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, member, group]);

  async function share() {
    if (!img) return;
    const data = { files: [img.file], title: "Mi carta navideña", text: `💌 Mi carta para el amigo secreto "${group.name}"` };
    try {
      if (navigator.canShare?.(data)) await navigator.share(data);
      else download();
    } catch {
      // el usuario cerró el menú de compartir
    }
  }

  function download() {
    if (!img) return;
    const a = document.createElement("a");
    a.href = img.url;
    a.download = img.file.name;
    a.click();
  }

  return (
    <>
      {/* lienzo fuera de pantalla que se convierte en imagen */}
      {open && (
        <div aria-hidden className="pointer-events-none fixed left-[-9999px] top-0">
          <div ref={ref}>
            <Card member={member} group={group} />
          </div>
        </div>
      )}
      <Sheet open={open} onClose={onClose}>
        <div className="flex flex-col items-center pb-6">
          <div className="flex aspect-[9/16] h-[52dvh] items-center justify-center overflow-hidden rounded-2xl bg-white/5">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url} alt="Tu carta" className="h-full w-full object-contain" />
            ) : (
              <span className="animate-bounce text-4xl">{error ? "😕" : "💌"}</span>
            )}
          </div>
          <p className="mt-3 text-sm text-snow/60">{error || (img ? "¡Lista para tus historias!" : "Armando tu carta…")}</p>
          <div className="mt-4 grid w-full grid-cols-[2fr_1fr] gap-2">
            <button disabled={!img} onClick={share} className="btn-primary rounded-2xl py-4 font-semibold disabled:opacity-40 active:scale-[0.97]">
              📤 Compartir
            </button>
            <button disabled={!img} onClick={download} className="glass rounded-2xl py-4 font-medium disabled:opacity-40">
              ⬇️ Guardar
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
