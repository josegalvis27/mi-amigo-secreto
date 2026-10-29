/** Baja de Google Fonts solo los caracteres que se van a dibujar (ImageResponse necesita el TTF). */
async function googleFont(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`Sin fuente ${family}`);
  return (await fetch(src)).arrayBuffer();
}

/** Fuentes de la marca; si Google Fonts falla, la imagen sale con la fuente por defecto. */
export async function ogFonts(xmasText: string, bodyText: string) {
  const fonts = await Promise.allSettled([
    googleFont("Mountains of Christmas", 700, xmasText).then((data) => ({ name: "Xmas", data, weight: 700 as const })),
    googleFont("Fredoka", 500, bodyText).then((data) => ({ name: "Fredoka", data, weight: 500 as const })),
    googleFont("Fredoka", 600, bodyText).then((data) => ({ name: "Fredoka", data, weight: 600 as const })),
  ]);
  return fonts.flatMap((f) => (f.status === "fulfilled" ? [{ ...f.value, style: "normal" as const }] : []));
}

export const OG_COLORS = {
  night: "#0a0f24",
  berry: "#e8304f",
  berry2: "#ff5d73",
  gold: "#ffc94a",
  snow: "#fdfaf3",
  pine: "#0e4d3a",
};

export const OG_BG = `radial-gradient(120% 70% at 50% -10%, #2a1f5c 0%, transparent 60%), radial-gradient(70% 60% at 100% 100%, rgba(14,77,58,0.7) 0%, transparent 70%), radial-gradient(60% 50% at 0% 90%, rgba(232,48,79,0.35) 0%, transparent 70%), ${OG_COLORS.night}`;

export const LIGHT_COLORS = ["#ff5d73", "#ffc94a", "#4ade80", "#60a5fa", "#f472b6"];
