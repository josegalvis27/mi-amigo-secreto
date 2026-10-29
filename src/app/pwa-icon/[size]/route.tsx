import { appIcon } from "@/lib/server/giftMark";

const SIZES = ["192", "512"];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

/** Íconos del manifest (Android los pide en 192 y 512). */
export async function GET(_: Request, { params }: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await params;
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });
  return appIcon(Number(size));
}
