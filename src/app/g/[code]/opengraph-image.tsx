import { ImageResponse } from "next/og";
import { fmtDay, groupSummary } from "@/lib/server/summary";
import { LIGHT_COLORS, OG_BG, OG_COLORS as C, ogFonts } from "@/lib/server/ogFonts";

export const alt = "Invitación al amigo secreto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TILTS = [-6, 4, -3, 5, -4];

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const g = await groupSummary(code).catch(() => null);

  const name = g?.name ?? "Amigo secreto";
  const shown = g?.names.slice(0, 5) ?? [];
  const extra = (g?.names.length ?? 0) - shown.length;
  const chips = g
    ? [
        `👥 ${g.names.length} ${g.names.length === 1 ? "persona" : "personas"}`,
        g.budget === null ? "💵 Presupuesto libre" : `💵 Hasta $${g.budget}`,
        `📅 ${fmtDay(g.date)}`,
      ]
    : [];
  const cta = g?.drawn ? "Entra a ver a quién le regalas 🎁" : "Toca para unirte 🎁";

  const fonts = await ogFonts(name + "Te invitaron al amigo secreto", chips.join("") + cta + shown.join("") + "+0123456789más");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: OG_BG, color: C.snow, fontFamily: "Fredoka" }}>
        {/* luces */}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-around", padding: "18px 40px 0" }}>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{ width: 22, height: 30, borderRadius: 12, background: LIGHT_COLORS[i % LIGHT_COLORS.length], boxShadow: `0 0 24px ${LIGHT_COLORS[i % LIGHT_COLORS.length]}`, marginTop: i % 2 ? 10 : 0 }} />
          ))}
        </div>

        <div style={{ display: "flex", marginTop: 26, fontSize: 32, color: "rgba(253,250,243,0.7)" }}>Te invitaron al amigo secreto</div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 4, fontFamily: "Xmas", fontWeight: 700, fontSize: name.length > 18 ? 80 : 100, lineHeight: 1.05, maxWidth: 1100, textAlign: "center" }}>
          <span style={{ marginRight: 20 }}>{g?.emoji ?? "🎄"}</span>
          <span style={{ color: C.gold }}>{name}</span>
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          {chips.map((c) => (
            <div key={c} style={{ display: "flex", padding: "10px 22px", borderRadius: 999, fontSize: 28, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
              {c}
            </div>
          ))}
        </div>

        {/* polaroids con los nombres de quienes ya están */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 34 }}>
          {shown.map((n, i) => (
            <div
              key={i}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 132, padding: "10px 10px 8px", background: "#fffaf0", borderRadius: 6, transform: `rotate(${TILTS[i]}deg)`, boxShadow: "0 18px 30px -10px rgba(0,0,0,0.6)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 112, height: 96, background: C.pine, fontSize: 52, fontWeight: 600, color: C.gold }}>
                {n.trim().charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 22, color: "#1c1a2e", maxWidth: 112, overflow: "hidden", whiteSpace: "nowrap" }}>{n}</div>
            </div>
          ))}
          {extra > 0 && <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: C.gold, marginLeft: 8 }}>+{extra} más</div>}
          {!g?.drawn && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 132, height: 140, border: "4px dashed rgba(255,255,255,0.35)", borderRadius: 8, fontSize: 64, color: "rgba(253,250,243,0.6)" }}>
              ?
            </div>
          )}
        </div>

        <div
          style={{ display: "flex", marginTop: "auto", marginBottom: 34, padding: "14px 40px", borderRadius: 999, fontSize: 32, fontWeight: 600, background: `linear-gradient(180deg, ${C.berry2}, ${C.berry})`, boxShadow: "0 12px 30px -8px rgba(232,48,79,0.8)" }}
        >
          {cta}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
