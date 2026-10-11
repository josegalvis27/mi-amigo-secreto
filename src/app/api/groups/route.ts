import { createDemo, createGroup } from "@/lib/server/groups";
import { errorResponse } from "@/lib/server/http";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = body?.demo ? await createDemo() : await createGroup(body);
    return Response.json({ code });
  } catch (e) {
    return errorResponse(e);
  }
}
