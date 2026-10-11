export type CostumeId = "none" | "sueter" | "santa" | "duende" | "reno" | "nieve";

export type Wish = {
  id: string;
  title: string;
  emoji: string;
  price?: number;
  link?: string;
  note?: string;
};

export type WishDraft = Omit<Wish, "id">;

/** Lo que cualquiera del grupo puede ver de un miembro. */
export type PublicMember = {
  id: string;
  name: string;
  emoji: string;
  costume?: CostumeId;
  /** URL de la foto (no el archivo) */
  photo?: string;
  wishes: Wish[];
};

export type Me = PublicMember & {
  isAdmin: boolean;
  letterDone: boolean;
  revealed: boolean;
};

/** Respuesta de GET /api/g/[code]. Nunca incluye el sorteo de los demás. */
export type GroupView = {
  code: string;
  name: string;
  emoji: string;
  budget: number | null;
  date: string;
  drawn: boolean;
  revealedCount: number;
  members: PublicMember[];
  me: Me | null;
  /** solo a quién le regalo YO */
  receiverId: string | null;
};

export type NewMember = {
  name: string;
  pin: string;
  photo?: string; // dataURL al enviar
  emoji: string;
  costume?: CostumeId;
};

export const AVATAR_EMOJIS = ["🎅", "🤶", "🧝", "⛄", "🦌", "😎", "🥳", "🤓", "😜"];
