import type { WishDraft } from "./types";

export type { WishDraft };

/** Ideas rápidas con precio de referencia en dólares. */
export const IDEAS: WishDraft[] = [
  { title: "Chocolates", emoji: "🍫", price: 3 },
  { title: "Galletas caseras", emoji: "🍪", price: 4 },
  { title: "Medias navideñas", emoji: "🧦", price: 5 },
  { title: "Taza bonita", emoji: "☕", price: 6 },
  { title: "Plantita", emoji: "🪴", price: 7 },
  { title: "Café de Mérida", emoji: "🫘", price: 8 },
  { title: "Vela aromática", emoji: "🕯️", price: 8 },
  { title: "Un libro", emoji: "📚", price: 10 },
  { title: "Agenda 2027", emoji: "📒", price: 10 },
  { title: "Juego de mesa", emoji: "🎲", price: 15 },
  { title: "Una franela", emoji: "👕", price: 15 },
  { title: "Cargador portátil", emoji: "🔋", price: 15 },
  { title: "Una botella de vino", emoji: "🍷", price: 18 },
  { title: "Audífonos", emoji: "🎧", price: 20 },
  { title: "Set de skincare", emoji: "🧴", price: 20 },
  { title: "Un perfume", emoji: "✨", price: 30 },
  { title: "Zapatos deportivos", emoji: "👟", price: 45 },
];

export const ideasFor = (budget: number | null) => (budget === null ? IDEAS : IDEAS.filter((i) => (i.price ?? 0) <= budget));
