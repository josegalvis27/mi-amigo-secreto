"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GroupView, NewMember, WishDraft } from "./types";

const POLL_MS = 5000;

async function post<T>(url: string, body: unknown): Promise<T> {
  const send = () => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  let res: Response;
  try {
    res = await send();
  } catch {
    // red inestable: un reintento antes de rendirse
    await new Promise((r) => setTimeout(r, 1200));
    try {
      res = await send();
    } catch {
      throw new Error("No hay conexión 📶 Revisa tu internet e intenta otra vez.");
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Algo salió mal, intenta otra vez");
  return data as T;
}

export const createGroup = (input: { name: string; emoji: string; budget: number | null; date: string; admin: NewMember }) =>
  post<{ code: string }>("/api/groups", input).then((r) => r.code);

export const createDemo = () => post<{ code: string }>("/api/groups", { demo: true }).then((r) => r.code);

export type GroupAction =
  | { action: "join"; member: NewMember }
  | { action: "login"; memberId: string; pin: string }
  | { action: "logout" }
  | { action: "updateMe"; patch: Partial<Pick<NewMember, "name" | "emoji" | "costume" | "photo">> }
  | { action: "addWishes"; wishes: WishDraft[]; finish?: boolean }
  | { action: "removeWish"; id: string }
  | { action: "draw" }
  | { action: "reveal" };

/**
 * Estado del grupo desde el servidor. Se refresca solo cada pocos segundos
 * (y al volver a la pestaña) para ver a quien se une o arma su carta.
 */
export function useGroup(code: string) {
  const [view, setView] = useState<GroupView | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const busy = useRef(0);

  const load = useCallback(async () => {
    if (busy.current) return; // no pisar una acción en curso
    try {
      const res = await fetch(`/api/g/${code}`, { cache: "no-store" });
      if (res.status === 404) return setStatus("notfound");
      if (!res.ok) throw new Error();
      setView(await res.json());
      setStatus("ok");
    } catch {
      setStatus((s) => (s === "ok" ? s : "error"));
    }
  }, [code]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const tick = () => document.visibilityState === "visible" && load();
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);

  const act = useCallback(
    async (a: GroupAction) => {
      busy.current++;
      try {
        setView(await post<GroupView>(`/api/g/${code}`, a));
      } finally {
        busy.current--;
      }
    },
    [code],
  );

  return { view, status, act, reload: load };
}
