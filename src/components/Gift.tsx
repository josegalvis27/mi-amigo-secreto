/** Caja de regalo dibujada con CSS. La tapa se separa para animarla. */
export function GiftBox({ size = 160, color = "#e8304f" }: { size?: number; color?: string }) {
  return (
    <div className="relative" style={{ width: size, height: size * 0.75 }}>
      <div
        className="absolute inset-0 rounded-b-xl"
        style={{
          background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, black))`,
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.25), 0 20px 40px -10px rgba(0,0,0,0.6)",
        }}
      />
      <div className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2 bg-gradient-to-r from-[#e9a92a] via-gold to-[#e9a92a]" />
    </div>
  );
}

export function GiftLid({ size = 160, color = "#e8304f" }: { size?: number; color?: string }) {
  const w = size * 1.12;
  return (
    <div className="relative" style={{ width: w, height: size * 0.22 }}>
      {/* lazo */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2" style={{ width: size * 0.6, height: size * 0.3 }}>
        <span
          className="absolute bottom-0 left-[4%] h-full w-[46%] rounded-[60%_10%_60%_40%] border-[6px] border-gold"
          style={{ transform: "rotate(-18deg)", transformOrigin: "bottom right" }}
        />
        <span
          className="absolute bottom-0 right-[4%] h-full w-[46%] rounded-[10%_60%_40%_60%] border-[6px] border-gold"
          style={{ transform: "rotate(18deg)", transformOrigin: "bottom left" }}
        />
        <span className="absolute -bottom-1 left-1/2 h-4 w-5 -translate-x-1/2 rounded-md bg-gold" />
      </div>
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${color} 85%, white), ${color})`,
          boxShadow: "0 6px 12px -4px rgba(0,0,0,0.4)",
        }}
      />
      <div className="absolute inset-y-0 left-1/2 w-[15%] -translate-x-1/2 bg-gradient-to-r from-[#e9a92a] via-gold to-[#e9a92a]" />
    </div>
  );
}

export default function Gift({ size = 160, color }: { size?: number; color?: string }) {
  return (
    <div className="flex flex-col items-center">
      <GiftLid size={size} color={color} />
      <GiftBox size={size} color={color} />
    </div>
  );
}
