"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { CostumeId } from "@/lib/types";
import { cropToDataUrl, loadImage, snapshot } from "@/lib/image";
import Character, { FACE_BOX } from "./Character";
import CostumeChips from "./CostumeChips";

/*
 * Estudio de foto a pantalla completa. La cámara (o la foto de la galería) va
 * debajo y el disfraz encima con un hueco en la cara, así ves cómo vas a quedar
 * antes de tomarla. Todas las medidas son fracciones del escenario cuadrado.
 */

const { left: HX, top: HY, size: HS } = FACE_BOX;
const CX = HX + HS / 2;
const CY = HY + HS / 2;
const CAMERA_ZOOM = 1.7;
const PHOTO_ZOOM = 1.2;
const clampZoom = (z: number) => Math.min(5, Math.max(1, z));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Pos = { x: number; y: number };

/** Dónde queda la foto en el escenario para un zoom y desplazamiento dados (sin dejar huecos en la cara). */
function layout(img: HTMLImageElement, zoom: number, pos: Pos) {
  const short = Math.min(img.naturalWidth, img.naturalHeight);
  const side = HS * zoom; // lo que mide el lado corto de la foto
  const w = (img.naturalWidth / short) * side;
  const h = (img.naturalHeight / short) * side;
  const left = Math.min(HX, Math.max(HX + HS - w, CX - w / 2 + pos.x));
  const top = Math.min(HY, Math.max(HY + HS - h, CY - h / 2 + pos.y));
  return { w, h, left, top, pxPerUnit: short / side };
}

type Props = {
  start: "camera" | HTMLImageElement;
  name: string;
  emoji: string;
  costume: CostumeId;
  onClose: () => void;
  onDone: (photo: string, costume: CostumeId) => void;
};

export default function PhotoStudio({ start, name, emoji, costume: initialCostume, onClose, onDone }: Props) {
  const [costume, setCostume] = useState(initialCostume);
  const [img, setImg] = useState<HTMLImageElement | null>(start === "camera" ? null : start);
  const [fromCamera, setFromCamera] = useState(start === "camera");
  const [zoom, setZoom] = useState(start === "camera" ? CAMERA_ZOOM : PHOTO_ZOOM);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [camError, setCamError] = useState("");
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const nativeCamRef = useRef<HTMLInputElement>(null);
  const pointers = useRef(new Map<number, Pos>());
  const live = !img;
  const noCameraApi = typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia;
  const error = noCameraApi ? "Este navegador no deja abrir la cámara aquí." : camError;

  useEffect(() => {
    if (!live || noCameraApi) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          v.play().catch(() => {});
        }
      })
      .catch((e: Error) =>
        setCamError(e.name === "NotAllowedError" ? "No diste permiso para usar la cámara." : "No pudimos abrir la cámara."),
      );
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [live, facing, noCameraApi]);

  // no dejar que la página de atrás se mueva mientras el estudio está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function showPhoto(photo: HTMLImageElement, camera: boolean) {
    setImg(photo);
    setFromCamera(camera);
    setPos({ x: 0, y: 0 });
    if (!camera) setZoom(PHOTO_ZOOM);
  }

  async function pickFile(file?: File) {
    if (file) showPhoto(await loadImage(file), false);
  }

  async function shoot() {
    for (const n of [3, 2, 1]) {
      setCount(n);
      await wait(750);
    }
    setCount(0);
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setFlash((f) => f + 1);
    // la foto conserva el mismo encuadre que se veía en vivo
    showPhoto(await snapshot(v, facing === "user"), true);
  }

  function retake() {
    setImg(null);
    setReady(false);
    setCamError("");
    setZoom(CAMERA_ZOOM);
  }

  function flip() {
    setReady(false);
    setFacing((f) => (f === "user" ? "environment" : "user"));
  }

  const crop = (image: HTMLImageElement, size?: number) => {
    const g = layout(image, zoom, pos);
    return cropToDataUrl(image, (HX - g.left) * g.pxPerUnit, (HY - g.top) * g.pxPerUnit, HS * g.pxPerUnit, size);
  };
  // miniatura para que los disfraces de abajo muestren tu cara
  const thumb = useMemo(() => (img ? crop(img, 96) : undefined), [img, zoom, pos]); // eslint-disable-line react-hooks/exhaustive-deps

  function done() {
    if (img) onDone(crop(img), costume);
  }

  // arrastrar con un dedo, pellizcar con dos
  function onPointerDown(e: PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }
  function onPointerMove(e: PointerEvent) {
    const map = pointers.current;
    const prev = map.get(e.pointerId);
    if (!prev) return;
    const now = { x: e.clientX, y: e.clientY };
    if (map.size >= 2) {
      const [a, b] = [...map.values()];
      const before = Math.hypot(a.x - b.x, a.y - b.y);
      map.set(e.pointerId, now);
      const [c, d] = [...map.values()];
      const after = Math.hypot(c.x - d.x, c.y - d.y);
      if (before > 0) setZoom((z) => clampZoom((z * after) / before));
      return;
    }
    map.set(e.pointerId, now);
    if (!img) return;
    const size = stageRef.current?.clientWidth || 1;
    setPos((p) => {
      const g = layout(img, zoom, p);
      return { x: g.left - (CX - g.w / 2) + (now.x - prev.x) / size, y: g.top - (CY - g.h / 2) + (now.y - prev.y) / size };
    });
  }
  const onPointerUp = (e: PointerEvent) => pointers.current.delete(e.pointerId);

  const g = img ? layout(img, zoom, pos) : null;
  const pct = (n: number) => `${n * 100}%`;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] bg-night"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 260 }}
    >
      <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between">
          <button onClick={onClose} className="glass flex h-10 w-10 items-center justify-center rounded-full text-lg" aria-label="Cerrar">
            ✕
          </button>
          <h2 className="font-xmas text-2xl font-bold">Tu foto navideña</h2>
          {live && !error ? (
            <button onClick={flip} className="glass flex h-10 w-10 items-center justify-center rounded-full text-lg" aria-label="Voltear cámara">
              🔄
            </button>
          ) : (
            <span className="w-10" />
          )}
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
          <div className="relative w-[min(100%,44dvh)] rounded-[6px] bg-snow p-2.5 pb-11 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]">
            <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-14 -translate-x-1/2 rotate-[-4deg] rounded-sm bg-gold/70 shadow-sm" />
            <div
              ref={stageRef}
              className="relative aspect-square w-full touch-none select-none overflow-hidden rounded-[3px] bg-ink"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={(e) => setZoom((z) => clampZoom(z * (e.deltaY < 0 ? 1.08 : 1 / 1.08)))}
            >
              {live ? (
                <div
                  className="absolute"
                  style={{ width: pct(HS * zoom), height: pct(HS * zoom), left: pct(CX - (HS * zoom) / 2), top: pct(CY - (HS * zoom) / 2) }}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    onLoadedData={() => setReady(true)}
                    className="h-full w-full object-cover"
                    style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }}
                  />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute max-w-none"
                  style={{ width: pct(g!.w), height: pct(g!.h), left: pct(g!.left), top: pct(g!.top) }}
                />
              )}

              {costume !== "none" ? (
                <Character costume={costume} emoji={emoji} hole className="pointer-events-none absolute inset-0 h-full w-full" />
              ) : (
                <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 h-full w-full">
                  <mask id="studio-hole">
                    <rect width="200" height="200" fill="#fff" />
                    <circle cx={CX * 200} cy={CY * 200} r={(HS / 2) * 200} fill="#000" />
                  </mask>
                  <rect width="200" height="200" fill="rgba(10,15,36,0.72)" mask="url(#studio-hole)" />
                  <circle cx={CX * 200} cy={CY * 200} r={(HS / 2) * 200} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="5 4" />
                </svg>
              )}

              {live && !ready && !error && (
                <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-snow/80">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
                    Abriendo la cámara… 📷
                  </motion.span>
                </div>
              )}

              {live && error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/90 p-4 text-center">
                  <span className="text-4xl">🙈</span>
                  <p className="text-sm text-snow">{error}</p>
                  <button onClick={() => nativeCamRef.current?.click()} className="btn-gold mt-1 w-full rounded-xl py-2 text-sm font-semibold">
                    📷 Tomar con la cámara del cel
                  </button>
                  <button onClick={() => galleryRef.current?.click()} className="glass w-full rounded-xl py-2 text-sm">
                    🖼️ Elegir de la galería
                  </button>
                </div>
              )}

              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 2.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center font-xmas text-[7rem] font-bold text-snow drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {flash > 0 && (
                  <motion.div
                    key={flash}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pointer-events-none absolute inset-0 bg-white"
                  />
                )}
              </AnimatePresence>
            </div>
            <p className="absolute inset-x-0 bottom-0 truncate px-2 pb-1 text-center font-hand text-3xl leading-tight text-ink">{name || "Tú"}</p>
          </div>

          <p className="text-center text-sm text-snow/70">
            {live ? "Pon tu cara en el disfraz y sonríe 😄" : "Arrastra y pellizca para acomodar tu cara"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CostumeChips costume={costume} photo={thumb} emoji={emoji} onPick={setCostume} size="sm" />
          <label className="flex items-center gap-3 px-2">
            <span className="text-sm">➖</span>
            <input
              type="range"
              min={1}
              max={5}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[var(--gold)]"
              aria-label="Zoom"
            />
            <span className="text-sm">➕</span>
          </label>

          {live ? (
            <div className="flex items-center justify-between px-4">
              <button
                onClick={() => galleryRef.current?.click()}
                className="glass flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                aria-label="Elegir de la galería"
              >
                🖼️
              </button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={shoot}
                disabled={!ready || count > 0}
                aria-label="Tomar foto"
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-snow transition disabled:opacity-40"
              >
                <span className="h-[60px] w-[60px] rounded-full bg-gradient-to-br from-berry to-berry-2 shadow-[0_0_24px_rgba(232,48,79,0.6)]" />
              </motion.button>
              <span className="w-12" />
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => (fromCamera ? retake() : galleryRef.current?.click())}
                className="glass rounded-2xl px-4 py-4 font-medium active:scale-[0.97]"
              >
                {fromCamera ? "↺ Otra" : "🖼️ Otra"}
              </button>
              <button onClick={done} className="btn-primary flex-1 rounded-2xl py-4 text-lg font-semibold active:scale-[0.97]">
                ¡Así quedo! ✨
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={nativeCamRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) loadImage(f).then((p) => showPhoto(p, false));
        }}
      />
    </motion.div>,
    document.body,
  );
}
