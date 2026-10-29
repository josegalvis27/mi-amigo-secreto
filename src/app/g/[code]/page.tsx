import { Suspense } from "react";
import type { Metadata } from "next";
import { fmtDay, groupSummary } from "@/lib/server/summary";
import GroupApp from "./GroupApp";

export async function generateMetadata({ params }: PageProps<"/g/[code]">): Promise<Metadata> {
  const code = (await params).code.toUpperCase();
  const g = await groupSummary(code).catch(() => null);
  if (!g) return { title: "Amigo secreto" };

  const people = g.names.length === 1 ? "1 persona" : `${g.names.length} personas`;
  const budget = g.budget === null ? "presupuesto libre" : `hasta $${g.budget}`;
  const title = `${g.emoji} ${g.name}: te invitaron al amigo secreto`;
  const description = g.drawn
    ? `El sorteo ya se hizo. Entra para ver a quién le regalas (${budget}, ${fmtDay(g.date)}).`
    : `Ya hay ${people} adentro. Únete, ponte tu foto navideña y arma tu carta de deseos (${budget}, ${fmtDay(g.date)}).`;
  return {
    title,
    description,
    openGraph: { type: "website", siteName: "Mi Amigo Secreto", locale: "es_419", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function GroupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <span className="animate-bounce text-5xl">🎁</span>
        </div>
      }
    >
      <GroupApp />
    </Suspense>
  );
}
