import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;
let _schema: Promise<void> | null = null;

/** Cliente perezoso: así `next build` no falla si aún no hay DATABASE_URL. */
export function sql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Falta DATABASE_URL");
    _sql = neon(url);
  }
  return _sql;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS groups (
    code text PRIMARY KEY,
    name text NOT NULL,
    emoji text NOT NULL,
    budget integer,
    date text NOT NULL,
    admin_id text NOT NULL,
    drawn_at timestamptz,
    is_demo boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS members (
    id text PRIMARY KEY,
    group_code text NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
    name text NOT NULL,
    phone text,
    pin_hash text,
    emoji text NOT NULL,
    costume text,
    photo text,
    photo_v integer NOT NULL DEFAULT 0,
    letter_done boolean NOT NULL DEFAULT false,
    receiver_id text,
    revealed boolean NOT NULL DEFAULT false,
    failed_logins integer NOT NULL DEFAULT 0,
    locked_until timestamptz,
    joined_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS wishes (
    id text PRIMARY KEY,
    member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title text NOT NULL,
    emoji text NOT NULL,
    price numeric,
    link text,
    note text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token text PRIMARY KEY,
    member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS members_group_idx ON members(group_code)`,
  // v2: se entra con nombre + PIN (sin teléfono), el nombre es único dentro del grupo
  `ALTER TABLE members ALTER COLUMN phone DROP NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS members_group_name_idx ON members (group_code, lower(name))`,
  `CREATE INDEX IF NOT EXISTS wishes_member_idx ON wishes(member_id)`,
];

/** Crea las tablas una vez por instancia. Idempotente. */
export function ensureSchema() {
  if (!_schema) {
    _schema = (async () => {
      for (const stmt of SCHEMA) await sql().query(stmt);
    })().catch((e) => {
      _schema = null;
      throw e;
    });
  }
  return _schema;
}
