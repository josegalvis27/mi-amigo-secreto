import { UserError } from "./groups";

export function errorResponse(e: unknown) {
  if (e instanceof UserError) return Response.json({ error: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ error: "Algo salió mal, intenta otra vez" }, { status: 500 });
}
