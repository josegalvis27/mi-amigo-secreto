import { addWishes, draw, getView, joinGroup, login, logout, removeWish, reveal, updateMe } from "@/lib/server/groups";
import { errorResponse } from "@/lib/server/http";

async function view(code: string) {
  const v = await getView(code);
  if (!v) return Response.json({ error: "Ese grupo no existe" }, { status: 404 });
  return Response.json(v, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(_req: Request, ctx: RouteContext<"/api/g/[code]">) {
  const { code } = await ctx.params;
  try {
    return await view(code.toUpperCase());
  } catch (e) {
    return errorResponse(e);
  }
}

/** Todas las acciones devuelven la vista actualizada del grupo. */
export async function POST(req: Request, ctx: RouteContext<"/api/g/[code]">) {
  const code = (await ctx.params).code.toUpperCase();
  try {
    const body = await req.json();
    switch (body?.action) {
      case "join":
        await joinGroup(code, body.member);
        break;
      case "login":
        await login(code, body.phone, body.pin);
        break;
      case "logout":
        await logout(code);
        break;
      case "updateMe":
        await updateMe(code, body.patch ?? {});
        break;
      case "addWishes":
        await addWishes(code, body.wishes, !!body.finish);
        break;
      case "removeWish":
        await removeWish(code, body.id);
        break;
      case "draw":
        await draw(code);
        break;
      case "reveal":
        await reveal(code);
        break;
      default:
        return Response.json({ error: "Acción desconocida" }, { status: 400 });
    }
    return await view(code);
  } catch (e) {
    return errorResponse(e);
  }
}
