"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function ShareInvite({ code, groupName }: { code: string; groupName: string }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/g/${code}`;
  const text = `🎁 ¡Te invito al amigo secreto "${groupName}"! 🎄\n\nEntra, ponte tu foto navideña y arma tu carta de deseos. No hay que descargar nada 👇`;

  // como `url`, se calcula en el cliente: este componente solo se monta después de una interacción
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copy(what: "link" | "code") {
    const value = what === "link" ? url : code;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Safari viejo / iframe sin permiso
      const t = Object.assign(document.createElement("textarea"), { value });
      document.body.append(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    navigator.vibrate?.(10);
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  }

  async function share() {
    try {
      await navigator.share({ title: `Amigo secreto: ${groupName}`, text, url });
    } catch {
      // canceló o el navegador no lo soporta: no pasa nada
    }
  }

  return (
    <div className="mt-6 flex w-full flex-col gap-3">
      <button onClick={() => copy("code")} className="glass rounded-3xl p-4 transition active:scale-[0.98]">
        <p className="text-xs uppercase tracking-[0.2em] text-snow/50">Código del grupo</p>
        <p className="mt-1 font-mono text-4xl font-bold tracking-[0.25em] text-gold">{code}</p>
        <p className="mt-1 h-4 text-xs text-snow/50">{copied === "code" ? "✅ Código copiado" : "Toca para copiar"}</p>
      </button>
      <motion.a
        whileTap={{ scale: 0.96 }}
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-lg font-semibold text-[#073b1c] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.2a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        Invitar por WhatsApp
      </motion.a>
      <div className="grid grid-cols-2 gap-2">
        {canShare && (
          <button onClick={share} className="glass rounded-2xl py-3 text-sm font-medium transition active:scale-[0.97]">
            📤 Otras apps
          </button>
        )}
        <button onClick={() => copy("link")} className={`glass rounded-2xl py-3 text-sm font-medium transition active:scale-[0.97] ${canShare ? "" : "col-span-2"}`}>
          {copied === "link" ? "✅ ¡Link copiado!" : "🔗 Copiar link"}
        </button>
      </div>
    </div>
  );
}
