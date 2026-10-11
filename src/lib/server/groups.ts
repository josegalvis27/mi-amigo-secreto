import { randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { ensureSchema, sql } from "./db";
import { normalizePhone, type CostumeId, type GroupView, type NewMember, type Wish, type WishDraft } from "../types";

const scrypt = promisify(scryptCb) as (pw: string, salt: string, len: number) => Promise<Buffer>;

export class UserError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const COSTUMES: CostumeId[] = ["none", "sueter", "santa", "duende", "reno", "nieve"];
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PHOTO = 250_000; // ~180 KB de JPEG en base64
const MAX_FAILED_LOGINS = 5;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 120;

const id = () => randomBytes(9).toString("base64url");
const cookieName = (code: string) => `mas_${code}`;

function newCode() {
  let c = "";
  for (let i = 0; i < 6; i++) c += CODE_CHARS[randomInt(CODE_CHARS.length)];
  return c;
}

async function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await scrypt(pin, salt, 32)).toString("hex")}`;
}

async function checkPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const got = await scrypt(pin, salt, 32);
  return timingSafeEqual(got, Buffer.from(hash, "hex"));
}

// ---------- validación ----------

const text = (v: unknown, max: number, field: string) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) throw new UserError(`Falta ${field}`);
  return s.slice(0, max);
};
const optText = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

function photo(v: unknown) {
  if (v == null || v === "") return null;
  if (typeof v !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(v)) throw new UserError("Foto inválida");
  if (v.length > MAX_PHOTO) throw new UserError("La foto es muy pesada");
  return v;
}

function costume(v: unknown): CostumeId {
  return COSTUMES.includes(v as CostumeId) ? (v as CostumeId) : "none";
}

function member(m: NewMember) {
  const phone = normalizePhone(String(m?.phone ?? ""));
  if (phone.length < 10) throw new UserError("Número de WhatsApp inválido");
  if (!/^\d{4}$/.test(String(m?.pin ?? ""))) throw new UserError("El PIN debe tener 4 números");
  return {
    name: text(m.name, 24, "tu nombre"),
    phone,
    pin: String(m.pin),
    emoji: text(m.emoji, 8, "el avatar"),
    costume: costume(m.costume),
    photo: photo(m.photo),
  };
}

function wish(w: WishDraft) {
  const link = optText(w?.link, 500);
  return {
    title: text(w?.title, 60, "el deseo"),
    emoji: optText(w?.emoji, 8) ?? "🎁",
    price: typeof w?.price === "number" && w.price > 0 && w.price < 100000 ? w.price : null,
    link: link && /^https?:\/\//.test(link) ? link : null,
    note: optText(w?.note, 60),
  };
}

// ---------- sesión ----------

async function startSession(code: string, memberId: string) {
  const token = randomBytes(24).toString("base64url");
  await sql()`INSERT INTO sessions (token, member_id) VALUES (${token}, ${memberId})`;
  (await cookies()).set(cookieName(code), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/** Id del miembro con sesión en este grupo, o null. */
export async function currentMemberId(code: string) {
  const token = (await cookies()).get(cookieName(code))?.value;
  if (!token) return null;
  const rows = await sql()`
    SELECT m.id FROM sessions s JOIN members m ON m.id = s.member_id
    WHERE s.token = ${token} AND m.group_code = ${code}`;
  return (rows[0]?.id as string) ?? null;
}

async function requireMember(code: string) {
  const meId = await currentMemberId(code);
  if (!meId) throw new UserError("Tu sesión expiró, vuelve a entrar", 401);
  return meId;
}

// ---------- lectura ----------

/** Todos los grupos en los que este navegador tiene sesión. */
export async function myGroups() {
  await ensureSchema();
  const tokens = (await cookies())
    .getAll()
    .filter((c) => c.name.startsWith("mas_"))
    .map((c) => c.value);
  if (!tokens.length) return [];
  const rows = await sql()`
    SELECT g.code, g.name, g.emoji, g.date, g.drawn_at IS NOT NULL AS drawn, m.revealed, m.name AS me
    FROM sessions s JOIN members m ON m.id = s.member_id JOIN groups g ON g.code = m.group_code
    WHERE s.token = ANY(${tokens})
    ORDER BY g.date`;
  return rows.map((r) => ({
    code: r.code as string,
    name: r.name as string,
    emoji: r.emoji as string,
    date: r.date as string,
    /** ya hay sorteo y aún no abro mi regalo */
    pending: !!r.drawn && !r.revealed,
  }));
}

export async function getView(code: string): Promise<GroupView | null> {
  await ensureSchema();
  const [groups, meId] = await Promise.all([sql()`SELECT * FROM groups WHERE code = ${code}`, currentMemberId(code)]);
  const g = groups[0];
  if (!g) return null;
  const [members, wishes] = await Promise.all([
    sql()`SELECT id, name, emoji, costume, photo IS NOT NULL AS has_photo, photo_v, letter_done, receiver_id, revealed
          FROM members WHERE group_code = ${code} ORDER BY joined_at`,
    sql()`SELECT w.* FROM wishes w JOIN members m ON m.id = w.member_id WHERE m.group_code = ${code} ORDER BY w.created_at`,
  ]);

  const byMember = new Map<string, Wish[]>();
  for (const w of wishes) {
    const list = byMember.get(w.member_id) ?? [];
    list.push({
      id: w.id,
      title: w.title,
      emoji: w.emoji,
      price: w.price == null ? undefined : Number(w.price),
      link: w.link ?? undefined,
      note: w.note ?? undefined,
    });
    byMember.set(w.member_id, list);
  }

  const pub = members.map((m) => ({
    id: m.id as string,
    name: m.name as string,
    emoji: m.emoji as string,
    costume: (m.costume ?? "none") as CostumeId,
    photo: m.has_photo ? `/api/photo/${m.id}?v=${m.photo_v}` : undefined,
    wishes: byMember.get(m.id) ?? [],
  }));
  const meRow = members.find((m) => m.id === meId);
  const mePub = pub.find((m) => m.id === meId);

  return {
    code: g.code,
    name: g.name,
    emoji: g.emoji,
    budget: g.budget,
    date: g.date,
    drawn: !!g.drawn_at,
    revealedCount: members.filter((m) => m.revealed).length,
    members: pub,
    me:
      meRow && mePub
        ? { ...mePub, isAdmin: g.admin_id === meId, letterDone: meRow.letter_done, revealed: meRow.revealed }
        : null,
    receiverId: meRow?.receiver_id ?? null,
  };
}

export async function getPhoto(memberId: string) {
  await ensureSchema();
  const rows = await sql()`SELECT photo FROM members WHERE id = ${memberId}`;
  const data = rows[0]?.photo as string | undefined;
  if (!data) return null;
  const [meta, b64] = data.split(",");
  return { type: meta.slice(5, meta.indexOf(";")), bytes: Buffer.from(b64, "base64") };
}

// ---------- escritura ----------

async function insertMember(code: string, raw: NewMember) {
  const m = member(raw);
  const memberId = id();
  try {
    await sql()`
      INSERT INTO members (id, group_code, name, phone, pin_hash, emoji, costume, photo)
      VALUES (${memberId}, ${code}, ${m.name}, ${m.phone}, ${await hashPin(m.pin)}, ${m.emoji}, ${m.costume}, ${m.photo})`;
  } catch (e) {
    if (String(e).includes("duplicate key")) throw new UserError("Ese número ya está en el grupo. Entra con tu PIN.");
    throw e;
  }
  return memberId;
}

export async function createGroup(input: {
  name: string;
  emoji: string;
  budget: number | null;
  date: string;
  admin: NewMember;
}) {
  await ensureSchema();
  const name = text(input?.name, 32, "el nombre del grupo");
  const date = text(input?.date, 10, "la fecha");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new UserError("Fecha inválida");
  const budget = typeof input.budget === "number" && input.budget > 0 ? Math.round(input.budget) : null;
  const emoji = text(input.emoji, 16, "el ícono");
  member(input.admin); // valida antes de crear el grupo

  let code = newCode();
  while ((await sql()`SELECT 1 FROM groups WHERE code = ${code}`).length) code = newCode();
  // el admin se inserta después; admin_id se fija enseguida
  await sql()`INSERT INTO groups (code, name, emoji, budget, date, admin_id) VALUES (${code}, ${name}, ${emoji}, ${budget}, ${date}, '')`;
  const adminId = await insertMember(code, input.admin);
  await sql()`UPDATE groups SET admin_id = ${adminId} WHERE code = ${code}`;
  await startSession(code, adminId);
  return code;
}

export async function joinGroup(code: string, raw: NewMember) {
  await ensureSchema();
  const g = (await sql()`SELECT drawn_at FROM groups WHERE code = ${code}`)[0];
  if (!g) throw new UserError("Ese grupo no existe", 404);
  if (g.drawn_at) throw new UserError("El sorteo ya se hizo, pídele al organizador que lo repita");
  await startSession(code, await insertMember(code, raw));
}

export async function login(code: string, phoneRaw: string, pin: string) {
  await ensureSchema();
  const phone = normalizePhone(String(phoneRaw ?? ""));
  const m = (await sql()`SELECT id, pin_hash, failed_logins, locked_until FROM members WHERE group_code = ${code} AND phone = ${phone}`)[0];
  if (!m || !m.pin_hash) throw new UserError("Número o PIN incorrecto");
  if (m.locked_until && new Date(m.locked_until) > new Date())
    throw new UserError("Muchos intentos fallidos. Espera 15 minutos o pídele ayuda al organizador.", 429);
  if (!(await checkPin(String(pin ?? ""), m.pin_hash))) {
    await sql()`
      UPDATE members SET failed_logins = failed_logins + 1,
        locked_until = CASE WHEN failed_logins + 1 >= ${MAX_FAILED_LOGINS} THEN now() + interval '15 minutes' ELSE NULL END
      WHERE id = ${m.id}`;
    throw new UserError("Número o PIN incorrecto");
  }
  await sql()`UPDATE members SET failed_logins = 0, locked_until = NULL WHERE id = ${m.id}`;
  await startSession(code, m.id);
}

export async function logout(code: string) {
  const store = await cookies();
  const token = store.get(cookieName(code))?.value;
  if (token) await sql()`DELETE FROM sessions WHERE token = ${token}`;
  store.delete(cookieName(code));
}

export async function updateMe(code: string, patch: Record<string, unknown>) {
  const meId = await requireMember(code);
  if ("name" in patch) await sql()`UPDATE members SET name = ${text(patch.name, 24, "tu nombre")} WHERE id = ${meId}`;
  if ("emoji" in patch) await sql()`UPDATE members SET emoji = ${text(patch.emoji, 8, "el avatar")} WHERE id = ${meId}`;
  if ("costume" in patch) await sql()`UPDATE members SET costume = ${costume(patch.costume)} WHERE id = ${meId}`;
  if ("photo" in patch) {
    // una URL /api/photo/... significa "sin cambios"
    const p = patch.photo;
    if (!(typeof p === "string" && p.startsWith("/api/photo/")))
      await sql()`UPDATE members SET photo = ${photo(p)}, photo_v = photo_v + 1 WHERE id = ${meId}`;
  }
}

export async function addWishes(code: string, drafts: WishDraft[], finish: boolean) {
  const meId = await requireMember(code);
  const list = (Array.isArray(drafts) ? drafts : []).slice(0, 20).map(wish);
  const count = Number((await sql()`SELECT count(*) FROM wishes WHERE member_id = ${meId}`)[0].count);
  if (count + list.length > 30) throw new UserError("Máximo 30 deseos por carta");
  for (const w of list)
    await sql()`INSERT INTO wishes (id, member_id, title, emoji, price, link, note)
                VALUES (${id()}, ${meId}, ${w.title}, ${w.emoji}, ${w.price}, ${w.link}, ${w.note})`;
  if (finish) await sql()`UPDATE members SET letter_done = true WHERE id = ${meId}`;
}

export async function removeWish(code: string, wishId: string) {
  const meId = await requireMember(code);
  await sql()`DELETE FROM wishes WHERE id = ${String(wishId)} AND member_id = ${meId}`;
}

/** Un solo ciclo aleatorio: nadie se toca a sí mismo y no hay parejas cerradas A↔B. */
export async function draw(code: string) {
  const meId = await requireMember(code);
  const g = (await sql()`SELECT admin_id, drawn_at FROM groups WHERE code = ${code}`)[0];
  if (g.admin_id !== meId) throw new UserError("Solo quien organiza puede hacer el sorteo", 403);
  if (g.drawn_at) throw new UserError("El sorteo ya se hizo");
  const ids = (await sql()`SELECT id FROM members WHERE group_code = ${code}`).map((r) => r.id as string);
  if (ids.length < 3) throw new UserError("Se necesitan al menos 3 personas");
  for (let i = ids.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const db = sql();
  await db.transaction([
    ...ids.map((giver, i) => db`UPDATE members SET receiver_id = ${ids[(i + 1) % ids.length]}, revealed = false WHERE id = ${giver}`),
    db`UPDATE groups SET drawn_at = now() WHERE code = ${code} AND drawn_at IS NULL`,
  ]);
}

export async function reveal(code: string) {
  const meId = await requireMember(code);
  await sql()`UPDATE members SET revealed = true WHERE id = ${meId} AND receiver_id IS NOT NULL`;
}

// ---------- demo ----------

const DEMO_PEOPLE: [string, string, CostumeId, WishDraft[]][] = [
  ["Mariana", "🤶", "sueter", [
    { title: "Taza con mi nombre", emoji: "☕", price: 8 },
    { title: "Velas aromáticas", emoji: "🕯️", price: 12, note: "Vainilla o canela" },
    { title: "Chocolate Savoy", emoji: "🍫", price: 5 },
  ]],
  ["Luis", "🦌", "reno", [
    { title: "Franela de la Vinotinto", emoji: "⚽", price: 25, note: "Talla M" },
    { title: "Cargador portátil", emoji: "🔋", price: 15 },
  ]],
  ["Gabriela", "⛄", "nieve", [
    { title: "Plantita para el escritorio", emoji: "🪴", price: 7 },
    { title: "Agenda 2027", emoji: "📒", price: 10 },
  ]],
  ["Andrés", "🧝", "duende", [
    { title: "Café de Mérida", emoji: "☕", price: 9 },
    { title: "Medias navideñas locas", emoji: "🧦", price: 6 },
  ]],
  ["Valentina", "🌟", "sueter", [
    { title: "Set de skincare", emoji: "🧴", price: 20 },
    { title: "Pulsera", emoji: "📿", price: 12 },
  ]],
];

/** Grupo de ejemplo nuevo para cada visitante, con él como organizador. */
export async function createDemo() {
  await ensureSchema();
  let code = newCode();
  while ((await sql()`SELECT 1 FROM groups WHERE code = ${code}`).length) code = newCode();
  const year = new Date().getFullYear();
  const adminId = id();
  const db = sql();
  const stmts = [
    db`INSERT INTO groups (code, name, emoji, budget, date, admin_id, is_demo)
       VALUES (${code}, 'Los Panas de la Ofi (ejemplo)', '🎄', 20, ${`${year}-12-19`}, ${adminId}, true)`,
    db`INSERT INTO members (id, group_code, name, phone, emoji, costume, letter_done, joined_at)
       VALUES (${adminId}, ${code}, 'Tú', ${`demo-${adminId}`}, '🎅', 'santa', true, now() - interval '6 hours')`,
    db`INSERT INTO wishes (id, member_id, title, emoji, price) VALUES (${id()}, ${adminId}, 'Audífonos inalámbricos', '🎧', 20)`,
  ];
  DEMO_PEOPLE.forEach(([name, emoji, cost, wishes], i) => {
    const mid = id();
    stmts.push(db`INSERT INTO members (id, group_code, name, phone, emoji, costume, letter_done, joined_at)
                  VALUES (${mid}, ${code}, ${name}, ${`demo-${mid}`}, ${emoji}, ${cost}, true, now() - ${`${5 - i} hours`}::interval)`);
    for (const w of wishes)
      stmts.push(db`INSERT INTO wishes (id, member_id, title, emoji, price, note) VALUES (${id()}, ${mid}, ${w.title}, ${w.emoji}, ${w.price ?? null}, ${w.note ?? null})`);
  });
  await db.transaction(stmts);
  await startSession(code, adminId);
  return code;
}
