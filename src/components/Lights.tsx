const COLORS = ["#ff5d73", "#ffc94a", "#4ade80", "#60a5fa", "#f472b6"];

/** Guirnalda de bombillos que cuelga arriba de la pantalla. */
export default function Lights({ count = 9 }: { count?: number }) {
  const seg = 100 / count;
  const path = Array.from({ length: count }, (_, i) => {
    const x0 = i * seg;
    return `${i === 0 ? `M0,2` : ""} Q${x0 + seg / 2},16 ${x0 + seg},2`;
  }).join(" ");

  return (
    <div aria-hidden className="pointer-events-none relative h-12 w-full">
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-6 w-full">
        <path d={path} fill="none" stroke="#1d2a1f" strokeWidth="0.6" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
      </svg>
      {Array.from({ length: count }, (_, i) => {
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${i * seg + seg / 2}%`, top: 10, transform: "translateX(-50%)" }}
          >
            <span className="h-1.5 w-2 rounded-sm bg-[#2b3a2d]" />
            <span
              className="h-4 w-2.5 rounded-b-full rounded-t-[40%]"
              style={{
                background: color,
                boxShadow: `0 0 12px 3px ${color}, 0 0 24px 6px ${color}55`,
                animation: `twinkle ${1.4 + (i % 3) * 0.5}s ease-in-out ${i * 0.17}s infinite`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
