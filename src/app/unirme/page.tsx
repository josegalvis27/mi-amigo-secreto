"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { GiftBox, GiftLid } from "@/components/Gift";

export default function UnirmePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <TopBar />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/g/${clean}`);
        }}
        className="flex flex-1 flex-col items-center px-5 pt-10 text-center"
      >
        <div className="flex flex-col items-center">
          <GiftLid size={90} color="#0e4d3a" />
          <GiftBox size={90} color="#0e4d3a" />
        </div>
        <h1 className="mt-8 font-xmas text-4xl font-bold">¿Cuál es el código?</h1>
        <p className="mt-1 text-snow/60">Te lo pasó quien organizó el grupo</p>
        <input
          value={clean}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ABC123"
          autoCapitalize="characters"
          autoFocus
          className="field mt-8 text-center font-mono text-3xl tracking-[0.3em] uppercase"
        />
        <button
          disabled={clean.length !== 6}
          className="btn-primary mt-6 w-full rounded-2xl py-4 text-lg font-semibold transition disabled:opacity-40 active:scale-[0.97]"
        >
          Entrar 🎄
        </button>
      </form>
    </main>
  );
}
