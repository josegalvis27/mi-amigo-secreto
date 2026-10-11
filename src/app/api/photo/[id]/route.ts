import { getPhoto } from "@/lib/server/groups";

export async function GET(_req: Request, ctx: RouteContext<"/api/photo/[id]">) {
  const { id } = await ctx.params;
  const photo = await getPhoto(id);
  if (!photo) return new Response("No encontrada", { status: 404 });
  // la URL lleva ?v=<versión>, así que puede cachearse para siempre
  return new Response(new Uint8Array(photo.bytes), {
    headers: { "Content-Type": photo.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
