import { cacheLife } from "next/cache";
import { ensureSchema, sql } from "./db";

export type GroupSummary = {
  name: string;
  emoji: string;
  budget: number | null;
  date: string;
  drawn: boolean;
  names: string[];
};

/** Lo mínimo para la vista previa del link (WhatsApp, iMessage…). Sin datos privados. */
export async function groupSummary(code: string): Promise<GroupSummary | null> {
  "use cache";
  cacheLife("minutes");
  await ensureSchema();
  const g = (await sql()`SELECT name, emoji, budget, date, drawn_at FROM groups WHERE code = ${code}`)[0];
  if (!g) return null;
  const members = await sql()`SELECT name FROM members WHERE group_code = ${code} ORDER BY joined_at`;
  return {
    name: g.name,
    emoji: g.emoji,
    budget: g.budget,
    date: g.date,
    drawn: !!g.drawn_at,
    names: members.map((m) => m.name as string),
  };
}

export const fmtDay = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("es", { day: "numeric", month: "long" });
