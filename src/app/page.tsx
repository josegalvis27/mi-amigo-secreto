"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Lights from "@/components/Lights";
import Gift from "@/components/Gift";
import Polaroid from "@/components/Polaroid";
import { DEMO_CODE, seedDemo } from "@/lib/store";

const FLOATERS = [
  { name: "Mari", emoji: "🤶", x: "-135%", y: "-62%", r: -12, d: 0 },
  { name: "Luis", emoji: "🦌", x: "135%", y: "-70%", r: 10, d: 0.4 },
  { name: "Gaby", emoji: "⛄", x: "-125%", y: "68%", r: 8, d: 0.8 },
  { name: "Chuo", emoji: "🧝", x: "128%", y: "62%", r: -8, d: 1.2 },
];

const FEATURES = [
  { icon: "🎁", title: "Sorteo con emoción", text: "Toca el regalo, sacúdelo y descubre a quién le vas a regalar." },
  { icon: "📸", title: "Tu carta navideña", text: "Tu foto y tu lista de deseos para que no te regalen otra taza." },
  { icon: "💸", title: "Con o sin presupuesto", text: "Pon un monto en dólares y la fecha del intercambio." },
  { icon: "📲", title: "Todo desde el cel", text: "Comparte el link por WhatsApp y listo. Sin descargar nada." },
];

export default function Home() {
  const router = useRouter();

  async function demo() {
    await seedDemo();
    router.push(`/g/${DEMO_CODE}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-x-hidden">
      <Lights />

      <section className="flex flex-col items-center px-5 pt-4 text-center">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-full px-4 py-1.5 text-sm"
        >
          Navidad en Venezuela 🇻🇪
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.1 }}
          className="mt-4 font-xmas text-[3.4rem] font-bold leading-[0.95]"
        >
          <span className="text-shine">Mi Amigo</span>
          <br />
          <span className="text-berry-2 drop-shadow-[0_0_20px_rgba(255,93,115,0.5)]">Secreto</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 max-w-xs text-balance text-snow/70"
        >
          Arma el intercambio con tus panas, la familia o la oficina en un minuto. 🎄
        </motion.p>

        {/* escena: regalo con polaroids flotando */}
        <div className="relative my-12 flex h-80 w-full items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, delay: 0.35 }}
          >
            <motion.div animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Gift size={120} />
            </motion.div>
          </motion.div>
          {FLOATERS.map((f) => (
            <motion.div
              key={f.name}
              className="absolute"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
              animate={{ opacity: 1, x: f.x, y: f.y, scale: 1 }}
              transition={{ type: "spring", damping: 14, delay: 0.6 + f.d * 0.3 }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + f.d, repeat: Infinity, ease: "easeInOut" }}>
                <Polaroid member={{ name: f.name, emoji: f.emoji }} size="sm" rotate={f.r} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link href="/crear" className="btn-primary rounded-2xl py-4 text-lg font-semibold active:scale-[0.97] transition">
            🎁 Crear mi grupo
          </Link>
          <Link href="/unirme" className="glass rounded-2xl py-4 text-lg font-medium active:scale-[0.97] transition">
            🔑 Tengo un código
          </Link>
          <button onClick={demo} className="py-2 text-sm text-gold underline-offset-4 hover:underline">
            👀 Ver un grupo de ejemplo
          </button>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-2 gap-3 px-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-3xl p-4"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-2 font-semibold leading-tight">{f.title}</h3>
            <p className="mt-1 text-sm leading-snug text-snow/60">{f.text}</p>
          </motion.div>
        ))}
      </section>

      <footer className="safe-bottom mt-12 px-5 pb-6 text-center text-sm text-snow/40">
        Hecho con 🫔 y mucho cariño en Venezuela
      </footer>
    </main>
  );
}
