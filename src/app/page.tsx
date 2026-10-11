"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

const SCENE_W = 360;
const SCENE_H = 330;

export default function Home() {
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // la escena se encoge para que todo quepa en la pantalla sin hacer scroll
  useEffect(() => {
    const el = sceneRef.current!;
    const ro = new ResizeObserver(([e]) => {
      setScale(Math.min(1, e.contentRect.height / SCENE_H, e.contentRect.width / SCENE_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  async function demo() {
    await seedDemo();
    router.push(`/g/${DEMO_CODE}`);
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden">
      <Lights />

      <section className="flex min-h-0 flex-1 flex-col items-center px-5 text-center">
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
          className="mt-[1.5dvh] font-xmas text-[clamp(2.6rem,7dvh,3.4rem)] font-bold leading-[0.95]"
        >
          <span className="text-shine">Mi Amigo</span>
          <br />
          <span className="text-berry-2 drop-shadow-[0_0_20px_rgba(255,93,115,0.5)]">Secreto</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-[1dvh] max-w-xs text-balance text-snow/70"
        >
          Arma el intercambio con tus panas, la familia o la oficina en un minuto. 🎄
        </motion.p>

        {/* escena: regalo con polaroids flotando */}
        <div ref={sceneRef} className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          <div className="relative flex items-center justify-center" style={{ width: SCENE_W, height: SCENE_H, transform: `scale(${scale})` }}>
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
        </div>

        <div className="safe-bottom flex w-full shrink-0 flex-col gap-2.5">
          <Link href="/crear" className="btn-primary rounded-2xl py-[min(1rem,2dvh)] text-lg font-semibold active:scale-[0.97] transition">
            🎁 Crear mi grupo
          </Link>
          <Link href="/unirme" className="glass rounded-2xl py-[min(1rem,2dvh)] text-lg font-medium active:scale-[0.97] transition">
            🔑 Tengo un código
          </Link>
          <button onClick={demo} className="py-1 text-sm text-gold underline-offset-4 hover:underline">
            👀 Ver un grupo de ejemplo
          </button>
          <p className="pb-1 text-xs text-snow/40">Gratis · Sin descargar nada · Se comparte por WhatsApp</p>
        </div>
      </section>

    </main>
  );
}
