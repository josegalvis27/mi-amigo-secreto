"use client";

import { useSyncExternalStore } from "react";

/*
 * MVP: todo vive en localStorage del teléfono para poder ver y probar la UI.
 * La forma de los datos ya es la que tendrá la base de datos real, así que
 * migrar es cambiar estas funciones por llamadas a la API.
 */

export type Wish = {
  id: string;
  title: string;
  emoji: string;
  price?: number;
  link?: string;
  note?: string;
};

export type Member = {
  id: string;
  name: string;
  phone: string;
  pin: string; // hash del PIN
  photo?: string; // dataURL comprimido
  emoji: string;
  wishes: Wish[];
  joinedAt: number;
};

export type Group = {
  code: string;
  name: string;
  emoji: string;
  budget: number | null; // en USD, null = sin límite
  date: string; // YYYY-MM-DD
  adminId: string;
  members: Member[];
  assignments: Record<string, string> | null; // quien regala -> a quien
  revealed: Record<string, boolean>;
  createdAt: number;
};

type State = {
  groups: Record<string, Group>;
  sessions: Record<string, string>; // code -> memberId
};

const KEY = "mas:v1";
const EMPTY: State = { groups: {}, sessions: {} };

let cachedRaw: string | null = null;
let cached: State = EMPTY;
const listeners = new Set<() => void>();

function read(): State {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    cached = raw ? (JSON.parse(raw) as State) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(next: State) {
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    throw new Error("No hay espacio en el teléfono. Prueba con una foto más pequeña.");
  }
  cachedRaw = raw;
  cached = next;
  listeners.forEach((l) => l());
}

function update(fn: (s: State) => State) {
  write(fn(structuredClone(read())));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** null mientras no se ha hidratado en el cliente */
export function useStore(): State | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

// ---------- utilidades ----------

export const uid = () => Math.random().toString(36).slice(2, 10);

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode() {
  let c = "";
  for (let i = 0; i < 6; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}

export async function hashPin(pin: string) {
  const data = new TextEncoder().encode(`mas:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const normalizePhone = (p: string) => p.replace(/\D/g, "").replace(/^58/, "0");

export const AVATAR_EMOJIS = ["🎅", "🤶", "🦌", "⛄", "🧝", "🎄", "🌟", "🍪", "🫔", "🎁"];

// ---------- acciones ----------

type NewMember = { name: string; phone: string; pin: string; photo?: string; emoji: string };

async function buildMember(m: NewMember): Promise<Member> {
  return {
    id: uid(),
    name: m.name.trim(),
    phone: normalizePhone(m.phone),
    pin: await hashPin(m.pin),
    photo: m.photo,
    emoji: m.emoji,
    wishes: [],
    joinedAt: Date.now(),
  };
}

export async function createGroup(input: {
  name: string;
  emoji: string;
  budget: number | null;
  date: string;
  admin: NewMember;
}) {
  const admin = await buildMember(input.admin);
  let code = newCode();
  while (read().groups[code]) code = newCode();
  const group: Group = {
    code,
    name: input.name.trim(),
    emoji: input.emoji,
    budget: input.budget,
    date: input.date,
    adminId: admin.id,
    members: [admin],
    assignments: null,
    revealed: {},
    createdAt: Date.now(),
  };
  update((s) => {
    s.groups[code] = group;
    s.sessions[code] = admin.id;
    return s;
  });
  return code;
}

export async function joinGroup(code: string, m: NewMember) {
  const g = read().groups[code];
  if (!g) throw new Error("Ese grupo no existe");
  if (g.assignments) throw new Error("El sorteo ya se hizo, pídele al organizador que lo repita");
  const phone = normalizePhone(m.phone);
  if (g.members.some((x) => x.phone === phone))
    throw new Error("Ese número ya está en el grupo. Entra con tu PIN.");
  const member = await buildMember(m);
  update((s) => {
    s.groups[code].members.push(member);
    s.sessions[code] = member.id;
    return s;
  });
}

export async function login(code: string, phone: string, pin: string) {
  const g = read().groups[code];
  if (!g) throw new Error("Ese grupo no existe");
  const hashed = await hashPin(pin);
  const m = g.members.find((x) => x.phone === normalizePhone(phone));
  if (!m || m.pin !== hashed) throw new Error("Número o PIN incorrecto");
  update((s) => {
    s.sessions[code] = m.id;
    return s;
  });
}

export function logout(code: string) {
  update((s) => {
    delete s.sessions[code];
    return s;
  });
}

export function updateMember(code: string, memberId: string, patch: Partial<Member>) {
  update((s) => {
    const m = s.groups[code].members.find((x) => x.id === memberId);
    if (m) Object.assign(m, patch);
    return s;
  });
}

export function addWish(code: string, memberId: string, wish: Omit<Wish, "id">) {
  update((s) => {
    s.groups[code].members.find((x) => x.id === memberId)?.wishes.push({ ...wish, id: uid() });
    return s;
  });
}

export function removeWish(code: string, memberId: string, wishId: string) {
  update((s) => {
    const m = s.groups[code].members.find((x) => x.id === memberId);
    if (m) m.wishes = m.wishes.filter((w) => w.id !== wishId);
    return s;
  });
}

/** Un solo ciclo: nadie se toca a sí mismo y no hay parejas cerradas A↔B. */
export function drawGroup(code: string) {
  update((s) => {
    const g = s.groups[code];
    const ids = g.members.map((m) => m.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const a: Record<string, string> = {};
    ids.forEach((id, i) => (a[id] = ids[(i + 1) % ids.length]));
    g.assignments = a;
    g.revealed = {};
    return s;
  });
}

export function markRevealed(code: string, memberId: string) {
  update((s) => {
    s.groups[code].revealed[memberId] = true;
    return s;
  });
}

// ---------- demo ----------

export const DEMO_CODE = "DEMO24";

export async function seedDemo() {
  if (read().groups[DEMO_CODE]) {
    update((s) => {
      s.sessions[DEMO_CODE] = s.groups[DEMO_CODE].adminId;
      return s;
    });
    return;
  }
  const pin = await hashPin("1234");
  const people: [string, string, Omit<Wish, "id">[]][] = [
    ["Tú", "🎅", [
      { title: "Audífonos inalámbricos", emoji: "🎧", price: 20 },
      { title: "Un libro de misterio", emoji: "📚", price: 10, note: "Nada de terror porfa" },
    ]],
    ["Mariana", "🤶", [
      { title: "Taza con mi nombre", emoji: "☕", price: 8 },
      { title: "Velas aromáticas", emoji: "🕯️", price: 12, note: "Vainilla o canela" },
      { title: "Chocolate Savoy", emoji: "🍫", price: 5 },
    ]],
    ["Luis", "🦌", [
      { title: "Franela de la Vinotinto", emoji: "⚽", price: 25, note: "Talla M" },
      { title: "Cargador portátil", emoji: "🔋", price: 15 },
    ]],
    ["Gabriela", "⛄", [
      { title: "Plantita para el escritorio", emoji: "🪴", price: 7 },
      { title: "Agenda 2027", emoji: "📒", price: 10 },
    ]],
    ["Andrés", "🧝", [
      { title: "Café de Mérida", emoji: "☕", price: 9 },
      { title: "Medias navideñas locas", emoji: "🧦", price: 6 },
    ]],
    ["Valentina", "🌟", [
      { title: "Set de skincare", emoji: "🧴", price: 20 },
      { title: "Pulsera", emoji: "📿", price: 12 },
    ]],
  ];
  const members: Member[] = people.map(([name, emoji, wishes], i) => ({
    id: uid(),
    name,
    phone: `041400000${i}`,
    pin,
    emoji,
    wishes: wishes.map((w) => ({ ...w, id: uid() })),
    joinedAt: Date.now() - (people.length - i) * 3600_000,
  }));
  const year = new Date().getFullYear();
  update((s) => {
    s.groups[DEMO_CODE] = {
      code: DEMO_CODE,
      name: "Los Panas de la Ofi",
      emoji: "🎄",
      budget: 20,
      date: `${year}-12-19`,
      adminId: members[0].id,
      members,
      assignments: null,
      revealed: {},
      createdAt: Date.now(),
    };
    s.sessions[DEMO_CODE] = members[0].id;
    return s;
  });
}
