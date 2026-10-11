"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function ShareInvite({ code, groupName }: { code: string; groupName: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/g/${code}`;
  const text = `🎁 ¡Te invito al amigo secreto "${groupName}"! Entra aquí, ponte tu foto navideña y arma tu carta 👉 ${url}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-6 flex w-full flex-col gap-3">
      <div className="glass rounded-3xl p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-snow/50">Código del grupo</p>
        <p className="mt-1 font-mono text-4xl font-bold tracking-[0.25em] text-gold">{code}</p>
      </div>
      <motion.a
        whileTap={{ scale: 0.96 }}
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-lg font-semibold text-[#073b1c] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.2a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        Invitar por WhatsApp
      </motion.a>
      <button onClick={copy} className="text-sm text-snow/60">
        {copied ? "✅ ¡Link copiado!" : "📋 Copiar link"}
      </button>
    </div>
  );
}
