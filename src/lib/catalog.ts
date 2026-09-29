import data from "@/data/products.json";
import type { Product, ProductSummary } from "./types";

export const products = data as Product[];

/** Amazon has ~40 top-level departments; this catalog's 22 categories fold into 7. */
export const departments = [
  { slug: "electronics", name: "Electronics", categories: ["smartphones", "laptops", "tablets", "mobile-accessories"] },
  { slug: "fashion-men", name: "Men's Fashion", categories: ["mens-shirts", "mens-shoes", "mens-watches", "sunglasses"] },
  {
    slug: "fashion-women",
    name: "Women's Fashion",
    categories: ["tops", "womens-dresses", "womens-shoes", "womens-bags", "womens-jewellery", "womens-watches"],
  },
  { slug: "beauty", name: "Beauty", categories: ["beauty", "fragrances", "skin-care"] },
  { slug: "home", name: "Home & Kitchen", categories: ["furniture", "home-decoration", "kitchen-accessories"] },
  { slug: "grocery", name: "Grocery", categories: ["groceries"] },
  { slug: "sports", name: "Sports", categories: ["sports-accessories"] },
] as const;

export type DepartmentSlug = (typeof departments)[number]["slug"];

const categoryNames: Record<string, string> = {
  "mens-shirts": "Men's Shirts",
  "mens-shoes": "Men's Shoes",
  "mens-watches": "Men's Watches",
  "womens-dresses": "Dresses",
  "womens-shoes": "Women's Shoes",
  "womens-bags": "Handbags",
  "womens-jewellery": "Jewellery",
  "womens-watches": "Women's Watches",
  "mobile-accessories": "Phone Accessories",
  "home-decoration": "Home Decor",
  "kitchen-accessories": "Kitchen",
  "skin-care": "Skin Care",
  "sports-accessories": "Sports & Fitness",
  tops: "Women's Tops",
};

export function categoryName(slug: string) {
  return categoryNames[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function departmentOf(category: string) {
  return departments.find((d) => (d.categories as readonly string[]).includes(category));
}

/** Clothing and shoes get sizes; nothing else in the catalog does. */
export function sizeKind(category: string): "apparel" | "shoes" | null {
  if (["mens-shirts", "tops", "womens-dresses"].includes(category)) return "apparel";
  if (["mens-shoes", "womens-shoes"].includes(category)) return "shoes";
  return null;
}

export function getProduct(id: number) {
  return products.find((p) => p.id === id);
}

export function summarize(p: Product): ProductSummary {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    brand: p.brand,
    price: p.price,
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    stock: p.stock,
    shippingInformation: p.shippingInformation,
    thumbnail: p.thumbnail,
    reviewCount: p.reviews.length,
  };
}

// ---------------------------------------------------------------- search

const ACCESSORY_WORDS = new Set(["case", "cover", "charger", "cable", "accessory", "accessorie", "stand", "holder", "earphone", "headphone", "stick", "adapter", "strap"]);

const STOP = new Set(["the", "a", "an", "for", "and", "of", "with", "in", "to"]);

function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

/** Crude plural folding so "shoes" finds "shoe" and "watches" finds "watch". */
function stem(t: string) {
  if (t.length > 4 && t.endsWith("es") && /(ch|sh|x|s)es$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}

/**
 * Relevance only. There are no sponsored slots to blend in, which is the point:
 * on amazon.com 4 of the first 5 results for "fitness clothing" were ads.
 */
export function search(query: string, department?: string) {
  const dept = departments.find((d) => d.slug === department);
  const pool = dept ? products.filter((p) => (dept.categories as readonly string[]).includes(p.category)) : products;
  const q = tokens(query).map(stem);
  if (q.length === 0) return pool;

  const scored = pool
    .map((p) => {
      const title = tokens(p.title).map(stem);
      const cat = tokens(`${p.category.replace(/-/g, " ")} ${categoryName(p.category)}`).map(stem);
      const brand = tokens(p.brand ?? "").map(stem);
      const tags = p.tags.flatMap((t) => tokens(t)).map(stem);
      const desc = new Set(tokens(p.description).map(stem));
      let score = 0;
      let matched = 0;
      for (const t of q) {
        const hit = (arr: string[]) => arr.some((w) => w === t || (t.length >= 3 && w.startsWith(t)));
        // Compound words: "phone" should find "iPhone" and "smartphones".
        const inside = (arr: string[]) => t.length >= 4 && arr.some((w) => w.includes(t));
        let s = 0;
        if (hit(title)) s += 5;
        else if (inside(title)) s += 3;
        if (hit(brand)) s += 4;
        if (hit(cat)) s += 3;
        // Being in the category that *is* the query beats being an accessory for it.
        if (inside(cat) && !cat.some((w) => w.includes("accessor"))) s += 4;
        if (hit(tags)) s += 2;
        if (desc.has(t)) s += 1;
        if (s > 0) matched++;
        score += s;
      }
      // Searching "phone" should show phones before phone cases, unless you asked for a case.
      const wantsAccessory = q.some((t) => ACCESSORY_WORDS.has(t));
      if (!wantsAccessory && p.category.includes("accessories") && p.category !== "sports-accessories") score -= 4;
      // Every query word has to match somewhere, like a real search box.
      return { p, score: matched === q.length ? Math.max(0.5, score + p.rating * 0.1) : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.p);
}

export function related(p: Product, n = 6) {
  return products
    .filter((x) => x.id !== p.id && x.category === p.category)
    .concat(products.filter((x) => x.id !== p.id && x.category !== p.category && departmentOf(x.category) === departmentOf(p.category)))
    .slice(0, n);
}
