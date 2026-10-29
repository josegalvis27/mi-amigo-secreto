import { ImageResponse } from "next/og";
import { OG_COLORS as C } from "./ogFonts";

/** El regalo rojo con lazo dorado de la portada, para ImageResponse (solo flexbox). */
export function GiftMark({ size }: { size: number }) {
  const ribbon = size * 0.16;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: size * 1.12 }}>
      {/* lazo */}
      <div style={{ display: "flex", width: size * 0.6, height: size * 0.28, justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ width: size * 0.27, height: size * 0.26, border: `${size * 0.05}px solid ${C.gold}`, borderRadius: "60% 10% 60% 40%", transform: "rotate(-18deg)" }} />
        <div style={{ width: size * 0.27, height: size * 0.26, border: `${size * 0.05}px solid ${C.gold}`, borderRadius: "10% 60% 40% 60%", transform: "rotate(18deg)" }} />
      </div>
      {/* tapa */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%", height: size * 0.22, borderRadius: size * 0.06, background: `linear-gradient(180deg, #f2687f, ${C.berry})` }}>
        <div style={{ width: ribbon, height: "100%", background: C.gold }} />
      </div>
      {/* caja */}
      <div style={{ display: "flex", justifyContent: "center", width: size, height: size * 0.75, borderRadius: `0 0 ${size * 0.08}px ${size * 0.08}px`, background: `linear-gradient(135deg, ${C.berry}, #a3213a)` }}>
        <div style={{ width: ribbon, height: "100%", background: C.gold }} />
      </div>
    </div>
  );
}

/** Ícono cuadrado de la app (pantalla de inicio, pestaña del navegador). */
export function appIcon(px: number, opts: { rounded?: boolean } = {}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: px * 0.06,
          borderRadius: opts.rounded ? px * 0.22 : 0,
          background: `radial-gradient(90% 80% at 50% 0%, #2a1f5c 0%, ${C.night} 75%)`,
        }}
      >
        <GiftMark size={px * 0.56} />
      </div>
    ),
    { width: px, height: px },
  );
}
