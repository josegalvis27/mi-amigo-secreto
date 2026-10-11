import type { PublicMember } from "@/lib/types";
import Character from "./Character";

type Props = {
  member: Pick<PublicMember, "name" | "photo" | "emoji" | "costume">;
  size?: "sm" | "md" | "lg";
  /** reemplaza el ancho por defecto del tamaño */
  width?: string;
  rotate?: number;
  caption?: string;
  className?: string;
};

const SIZES = {
  sm: { w: "w-24", pad: "p-1.5 pb-6", text: "text-lg", emoji: "text-4xl" },
  md: { w: "w-40", pad: "p-2 pb-9", text: "text-2xl", emoji: "text-6xl" },
  lg: { w: "w-60", pad: "p-3 pb-12", text: "text-3xl", emoji: "text-8xl" },
};

/** Foto tipo polaroid con cinta adhesiva. Si tiene disfraz, dibuja el personaje. */
export default function Polaroid({ member, size = "md", width, rotate = 0, caption, className = "" }: Props) {
  const s = SIZES[size];
  const costume = member.costume && member.costume !== "none" ? member.costume : null;
  return (
    <div
      className={`relative ${width ?? s.w} ${s.pad} rounded-[6px] bg-snow shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-14 -translate-x-1/2 rotate-[-4deg] rounded-sm bg-gold/70 shadow-sm" />
      <div className="relative aspect-square w-full overflow-hidden rounded-[3px] bg-gradient-to-br from-pine to-[#1b6b52]">
        {costume ? (
          <Character costume={costume} photo={member.photo} emoji={member.emoji} className="h-full w-full" />
        ) : member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${s.emoji}`}>{member.emoji}</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/20" />
      </div>
      {!costume && (
        <span className={`absolute -right-3 -top-4 ${size === "sm" ? "text-2xl" : "text-4xl"} rotate-[20deg] drop-shadow`}>🎅</span>
      )}
      <p className={`absolute inset-x-0 bottom-0 truncate px-2 pb-1 text-center font-hand ${s.text} leading-tight text-ink`}>
        {caption ?? member.name}
      </p>
    </div>
  );
}
