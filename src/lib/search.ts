/**
 * Relevance-only search, shared by the results page (server) and the header's
 * suggestions (client). There are no sponsored slots to blend in: on amazon.com,
 * 4 of the first 5 results for "fitness clothing" were ads.
 */

type Searchable = { name: string; brand: string | null; category: string; subcategory: string; tags: string[]; description?: string; rating?: number };

const STOP = new Set(["the", "a", "an", "for", "and", "of", "with", "in", "to"]);
const ACCESSORY_WORDS = new Set(["case", "cover", "charger", "cable", "accessory", "stand", "holder", "earphone", "headphone", "stick", "adapter", "strap", "airpod", "speaker"]);

export function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

/** Crude plural folding so "shoes" finds "shoe" and "watches" finds "watch". */
function stem(t: string) {
  if (t.length > 4 && /(ch|sh|x|s)es$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

export function score<T extends Searchable>(p: T, query: string) {
  const q = tokens(query).map(stem);
  if (q.length === 0) return 1;
  const name = tokens(p.name).map(stem);
  const cat = tokens(`${p.category} ${p.subcategory}`).map(stem);
  const brand = tokens(p.brand ?? "").map(stem);
  const tags = p.tags.flatMap(tokens).map(stem);
  const desc = new Set(tokens(p.description ?? "").map(stem));
  let total = 0;
  for (const t of q) {
    const hit = (arr: string[]) => arr.some((w) => w === t || (t.length >= 3 && w.startsWith(t)));
    // Compound words: "phone" should find "iPhone" and "smartphones".
    const inside = (arr: string[]) => t.length >= 4 && arr.some((w) => w.includes(t));
    let s = 0;
    if (hit(name)) s += 5;
    else if (inside(name)) s += 3;
    if (hit(brand)) s += 4;
    if (hit(cat)) s += 3;
    else if (inside(cat)) s += 4; // being a smartphone beats mentioning phones
    if (hit(tags)) s += 2;
    if (desc.has(t)) s += 1;
    if (s === 0) return 0; // every word has to match somewhere
    total += s;
  }
  // "phone" should show phones before phone cases, unless you asked for a case.
  const accessory = p.subcategory === "Audio & Phone";
  if (accessory && !q.some((t) => ACCESSORY_WORDS.has(t))) total -= 4;
  return Math.max(0.5, total + (p.rating ?? 0) * 0.1);
}

export function rank<T extends Searchable>(items: T[], query: string) {
  if (!tokens(query).length) return items;
  return items
    .map((p) => ({ p, s: score(p, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}
