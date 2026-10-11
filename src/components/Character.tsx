import { useId, type ReactNode } from "react";
import type { CostumeId } from "@/lib/types";

/*
 * Personaje navideño: la cara (foto o emoji) va en un círculo y encima se
 * dibuja el disfraz. Todo en SVG para que escale y se pueda exportar a imagen.
 * Lienzo 200x200, cara centrada en (100, 84) con radio 40.
 */

const FACE = { cx: 100, cy: 84, r: 40 };
const SKIN = "#f1c7a3";

type Costume = {
  label: string;
  icon: string;
  bg: [string, string];
  /** detrás de la cara */
  back?: ReactNode;
  /** delante de la cara */
  front?: ReactNode;
};

const knitStripe = (y: number, color: string) => (
  <path
    d={`M14,${y} ${Array.from({ length: 18 }, (_, i) => `L${14 + i * 10 + 5},${y + (i % 2 ? -6 : 6)}`).join(" ")} L194,${y}`}
    fill="none"
    stroke={color}
    strokeWidth="4"
    strokeLinejoin="round"
  />
);

const body = (fill: string) => <path d="M10,200 C14,150 52,128 100,128 C148,128 186,150 190,200 Z" fill={fill} />;

export const COSTUMES: Record<Exclude<CostumeId, "none">, Costume> = {
  sueter: {
    label: "Suéter",
    icon: "🧶",
    bg: ["#0e4d3a", "#16765a"],
    back: (
      <>
        {body("#c81d3a")}
        <clipPath id="sw-clip">
          <path d="M10,200 C14,150 52,128 100,128 C148,128 186,150 190,200 Z" />
        </clipPath>
        <g clipPath="url(#sw-clip)">
          {knitStripe(156, "#fff")}
          {knitStripe(190, "#fff")}
          {[40, 70, 100, 130, 160].map((x) => (
            <g key={x} transform={`translate(${x},173)`}>
              <path d="M0,-8 L7,4 L-7,4 Z" fill="#1f8a4c" />
              <rect x="-1.5" y="4" width="3" height="4" fill="#7a4a1d" />
            </g>
          ))}
          {[55, 85, 115, 145].map((x) => (
            <circle key={x} cx={x} cy="142" r="2.6" fill="#ffc94a" />
          ))}
        </g>
        <path d="M70,130 Q100,148 130,130" fill="none" stroke="#1f8a4c" strokeWidth="9" strokeLinecap="round" />
      </>
    ),
    front: (
      <>
        <path d="M58,74 Q58,34 100,32 Q142,34 142,74 Z" fill="#1f8a4c" />
        {[66, 80, 94, 108, 122, 134].map((x) => (
          <circle key={x} cx={x} cy="50" r="2.4" fill="#fff" opacity="0.8" />
        ))}
        <rect x="54" y="66" width="92" height="14" rx="7" fill="#fff" />
        <circle cx="100" cy="28" r="10" fill="#fff" />
      </>
    ),
  },
  santa: {
    label: "Santa",
    icon: "🎅",
    bg: ["#183a6b", "#2a5aa0"],
    back: (
      <>
        {body("#d62839")}
        <rect x="90" y="128" width="20" height="72" fill="#fff" />
        <rect x="10" y="170" width="180" height="13" fill="#1c1a2e" />
        <rect x="86" y="167" width="28" height="19" rx="3" fill="none" stroke="#ffc94a" strokeWidth="4" />
      </>
    ),
    front: (
      <>
        <path d="M66,106 Q64,152 100,154 Q136,152 134,106 Q126,124 100,126 Q74,124 66,106 Z" fill="#fff" />
        <path d="M58,70 C62,28 118,8 152,36 L166,62 L146,66 C138,50 126,44 116,44 C132,52 142,62 142,70 Z" fill="#d62839" />
        <rect x="52" y="62" width="96" height="17" rx="8.5" fill="#fff" />
        <circle cx="164" cy="64" r="11" fill="#fff" />
      </>
    ),
  },
  duende: {
    label: "Duende",
    icon: "🧝",
    bg: ["#7a1630", "#a8223f"],
    back: (
      <>
        <path d="M64,82 L34,62 L66,100 Z" fill={SKIN} />
        <path d="M136,82 L166,62 L134,100 Z" fill={SKIN} />
        {body("#1f8a4c")}
        <path d="M58,134 L72,154 L86,136 L100,156 L114,136 L128,154 L142,134 Q100,122 58,134 Z" fill="#e8304f" />
        {[166, 186].map((y) => (
          <circle key={y} cx="100" cy={y} r="4.5" fill="#ffc94a" />
        ))}
      </>
    ),
    front: (
      <>
        <path d="M58,70 Q86,-6 156,6 Q120,24 142,70 Z" fill="#1f8a4c" />
        <rect x="54" y="62" width="92" height="14" rx="7" fill="#e8304f" />
        <circle cx="157" cy="7" r="8" fill="#ffc94a" />
      </>
    ),
  },
  reno: {
    label: "Reno",
    icon: "🦌",
    bg: ["#0e4d3a", "#16765a"],
    back: (
      <>
        <g stroke="#7a4a1d" strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M74,50 L56,12 M64,30 L42,26 M60,20 L66,4" />
          <path d="M126,50 L144,12 M136,30 L158,26 M140,20 L134,4" />
        </g>
        <ellipse cx="54" cy="62" rx="14" ry="8" transform="rotate(-30 54 62)" fill="#9b6a3c" />
        <ellipse cx="146" cy="62" rx="14" ry="8" transform="rotate(30 146 62)" fill="#9b6a3c" />
        <circle cx={FACE.cx} cy={FACE.cy} r={FACE.r + 12} fill="#9b6a3c" />
        {body("#9b6a3c")}
        <path d="M70,200 Q72,150 100,146 Q128,150 130,200 Z" fill="#d9b48a" />
      </>
    ),
    front: <circle cx="100" cy="134" r="7" fill="#e8304f" />,
  },
  nieve: {
    label: "Muñeco",
    icon: "⛄",
    bg: ["#1d3c78", "#2f5bb0"],
    back: (
      <>
        <ellipse cx="100" cy="200" rx="86" ry="72" fill="#fdfaf3" />
        {[152, 172, 192].map((y) => (
          <circle key={y} cx="100" cy={y} r="5" fill="#1c1a2e" />
        ))}
        <path d="M62,128 Q100,142 138,128 L138,140 Q100,154 62,140 Z" fill="#e8304f" />
        <path d="M124,136 L134,178 L118,178 L112,140 Z" fill="#c81d3a" />
      </>
    ),
    front: (
      <>
        <rect x="56" y="48" width="88" height="10" rx="4" fill="#1c1a2e" />
        <rect x="70" y="8" width="60" height="44" rx="4" fill="#1c1a2e" />
        <rect x="70" y="38" width="60" height="9" fill="#e8304f" />
        <circle cx="122" cy="42" r="4" fill="#4ade80" />
      </>
    ),
  },
};

export const COSTUME_IDS = ["none", ...Object.keys(COSTUMES)] as CostumeId[];

type Props = {
  costume: Exclude<CostumeId, "none">;
  photo?: string;
  emoji: string;
  className?: string;
};

export default function Character({ costume, photo, emoji, className = "" }: Props) {
  const c = COSTUMES[costume];
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`Disfraz de ${c.label}`}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.bg[0]} />
          <stop offset="1" stopColor={c.bg[1]} />
        </linearGradient>
        <clipPath id={`face${id}`}>
          <circle cx={FACE.cx} cy={FACE.cy} r={FACE.r} />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={`url(#bg${id})`} />
      {[[24, 30], [176, 24], [30, 110], [172, 104], [150, 150], [44, 160]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#fff" opacity="0.6" />
      ))}
      {c.back}
      {photo ? (
        <>
          <circle cx={FACE.cx} cy={FACE.cy} r={FACE.r} fill={SKIN} />
          <image
            href={photo}
            x={FACE.cx - FACE.r}
            y={FACE.cy - FACE.r}
            width={FACE.r * 2}
            height={FACE.r * 2}
            clipPath={`url(#face${id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <text x={FACE.cx} y={FACE.cy + 2} fontSize="72" textAnchor="middle" dominantBaseline="central">
          {emoji}
        </text>
      )}
      {c.front}
    </svg>
  );
}
