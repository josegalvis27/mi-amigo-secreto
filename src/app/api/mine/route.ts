import { myGroups } from "@/lib/server/groups";
import { errorResponse } from "@/lib/server/http";

export async function GET() {
  try {
    return Response.json(await myGroups(), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return errorResponse(e);
  }
}
