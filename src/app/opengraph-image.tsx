import { ImageResponse } from "next/og";
import { GiftMark } from "@/lib/server/giftMark";
import { LIGHT_COLORS, OG_BG, OG_COLORS as C, ogFonts } from "@/lib/server/ogFonts";

export const alt = "Mi Amigo Secreto: arma el intercambio navideño con tus amigos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FRIENDS = [
  { name: "Mari", emoji: "🤶", r: -8 },
  { name: "Luis", emoji: "🦌", r: 6 },
  { name: "Gaby", emoji: "⛄", r: -5 },
  { name: "Chuo", emoji: "🧝", r: 7 },
];

function Polaroid({ name, emoji, r }: (typeof FRIENDS)[number]) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 150, padding: "11px 11px 8px", background: "#fffaf0", borderRadius: 6, transform: `rotate(${r}deg)`, boxShadow: "0 18px 30px -10px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 128, height: 112, background: C.pine, fontSize: 70 }}>{emoji}</div>
      <div style={{ display: "flex", marginTop: 6, fontSize: 24, color: "#1c1a2e" }}>{name}</div>
    </div>
  );
}

export default async function Image() {
  const fonts = await ogFonts("Mi Amigo Secreto", "Arma el intercambio con tus amigos, la familia o la oficina.Gratis·Sin descargar nadaSin registro" + FRIENDS.map((f) => f.name).join(""));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: OG_BG, color: C.snow, fontFamily: "Fredoka" }}>
        <div style={{ position: "absolute", top: 18, left: 40, right: 40, display: "flex", justifyContent: "space-around" }}>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{ width: 22, height: 30, borderRadius: 12, background: LIGHT_COLORS[i % LIGHT_COLORS.length], boxShadow: `0 0 24px ${LIGHT_COLORS[i % LIGHT_COLORS.length]}`, marginTop: i % 2 ? 10 : 0 }} />
          ))}
        </div>

        {/* texto */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 620, paddingLeft: 80 }}>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Xmas", fontWeight: 700, fontSize: 118, lineHeight: 0.95 }}>
            <span>Mi Amigo</span>
            <span style={{ color: C.berry2 }}>Secreto</span>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 34, lineHeight: 1.3, color: "rgba(253,250,243,0.8)" }}>
            Arma el intercambio con tus amigos, la familia o la oficina.
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 26, color: C.gold }}>Gratis · Sin descargar nada · Sin registro</div>
        </div>

        {/* escena */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div style={{ position: "absolute", top: 80, left: 20, display: "flex" }}><Polaroid {...FRIENDS[0]} /></div>
          <div style={{ position: "absolute", top: 70, right: 30, display: "flex" }}><Polaroid {...FRIENDS[1]} /></div>
          <div style={{ position: "absolute", bottom: 50, left: 30, display: "flex" }}><Polaroid {...FRIENDS[2]} /></div>
          <div style={{ position: "absolute", bottom: 60, right: 20, display: "flex" }}><Polaroid {...FRIENDS[3]} /></div>
          <GiftMark size={170} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
