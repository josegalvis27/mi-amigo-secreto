"use client";

import { useRef, useState } from "react";
import { cropToDataUrl } from "@/lib/image";
import Sheet from "./Sheet";

const VIEW = 260;

type Props = { image: HTMLImageElement | null; onClose: () => void; onDone: (dataUrl: string) => void };

/** Arrastra y haz zoom para que la cara quede dentro del círculo. */
export default function FaceCropper({ image, onClose, onDone }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  if (!image) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

  const base = VIEW / Math.min(image.naturalWidth, image.naturalHeight);
  const scale = base * zoom;
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  const clamp = (v: number, size: number) => Math.min(0, Math.max(VIEW - size, v));
  const left = clamp((VIEW - w) / 2 + pos.x, w);
  const top = clamp((VIEW - h) / 2 + pos.y, h);

  function done() {
    onDone(cropToDataUrl(image!, -left / scale, -top / scale, VIEW / scale));
  }

  return (
    <Sheet open onClose={onClose}>
      <div className="flex flex-col items-center pb-6">
        <h3 className="font-xmas text-3xl font-bold">Acomoda tu cara 🎯</h3>
        <p className="mt-1 text-sm text-snow/60">Arrastra y haz zoom para que quede en el círculo</p>
        <div
          className="relative mt-5 touch-none overflow-hidden rounded-3xl bg-black"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, px: left - (VIEW - w) / 2, py: top - (VIEW - h) / 2 };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (d) setPos({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y });
          }}
          onPointerUp={() => (drag.current = null)}
          // evita que el Sheet se arrastre al mover la foto
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{ width: w, height: h, left, top }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at 50% 50%, transparent 39%, rgba(10,15,36,0.75) 40%)" }}
          />
          <div className="pointer-events-none absolute inset-[11%] rounded-full border-2 border-dashed border-gold" />
        </div>
        <label className="mt-5 flex w-full max-w-[260px] items-center gap-3">
          <span>➖</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[var(--gold)]"
            aria-label="Zoom"
          />
          <span>➕</span>
        </label>
        <button onClick={done} className="btn-primary mt-6 w-full rounded-2xl py-4 text-lg font-semibold active:scale-[0.97]">
          Usar esta foto ✨
        </button>
      </div>
    </Sheet>
  );
}
