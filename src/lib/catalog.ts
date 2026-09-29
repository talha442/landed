import raw from "@/data/products.json";
import type { Availability, Product, ProductSummary, SearchEntry } from "./types";

import { departments } from "./catalog-meta";

export { departments, getDepartment, type Department } from "./catalog-meta";

const SUBCATEGORY: Record<string, string> = {
  smartphones: "Smartphones",
  laptops: "Laptops",
  tablets: "Tablets",
  "mobile-accessories": "Audio & Phone",
  sunglasses: "Sunglasses",
  "mens-watches": "Men's Watches",
  "womens-watches": "Women's Watches",
  "womens-bags": "Bags",
  "womens-jewellery": "Jewellery",
  "mens-shirts": "Men's Shirts",
  tops: "Women's Tops",
  "womens-dresses": "Dresses",
  "mens-shoes": "Men's Shoes",
  "womens-shoes": "Women's Shoes",
  beauty: "Makeup",
  fragrances: "Fragrance",
  "skin-care": "Skin Care",
  furniture: "Furniture",
  "home-decoration": "Decor",
  "kitchen-accessories": "Kitchen",
  "sports-accessories": "Sports Gear",
  groceries: "Groceries",
};

type Raw = (typeof raw)[number];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function availability(stock: number): Availability {
  if (stock === 0) return "Out of stock";
  if (stock <= 5) return "Low stock";
  return "In stock";
}

function sizeKind(category: string): Product["sizeKind"] {
  if (["mens-shirts", "tops", "womens-dresses"].includes(category)) return "apparel";
  if (["mens-shoes", "womens-shoes"].includes(category)) return "shoes";
  return null;
}

function toProduct(p: Raw, id: string): Product {
  const dept = departments.find((d) => (d.categories as readonly string[]).includes(p.category))!;
  // Only call it a discount when it's worth mentioning; "-1%" badges are noise.
  const onSale = p.discountPercentage >= 10;
  const d = p.dimensions;
  return {
    id,
    name: p.title,
    description: p.description,
    category: dept.slug,
    subcategory: SUBCATEGORY[p.category] ?? p.category,
    brand: p.brand ?? null,
    price: p.price,
    originalPrice: onSale ? Math.round((p.price / (1 - p.discountPercentage / 100)) * 100) / 100 : undefined,
    discount: onSale ? Math.round(p.discountPercentage) : undefined,
    rating: Math.round(p.rating * 10) / 10,
    reviewCount: p.reviews.length,
    images: p.images.length ? p.images : [p.thumbnail],
    thumbnail: p.thumbnail,
    availability: availability(p.stock),
    stock: p.stock,
    specifications: {
      ...(p.brand ? { Brand: p.brand } : {}),
      Category: SUBCATEGORY[p.category] ?? p.category,
      Weight: `${p.weight} kg`,
      Dimensions: `${d.width} × ${d.height} × ${d.depth} cm`,
      Warranty: p.warranty,
      Returns: p.returnPolicy,
      Dispatch: p.shippingInformation,
      SKU: p.sku,
    },
    deliveryInfo: p.shippingInformation,
    warranty: p.warranty,
    returnPolicy: p.returnPolicy,
    tags: p.tags,
    reviews: p.reviews,
    sizeKind: sizeKind(p.category),
  };
}

const seen = new Set<string>();
export const products: Product[] = raw.map((p) => {
  let id = slugify(p.title);
  if (seen.has(id)) id = `${id}-${p.id}`;
  seen.add(id);
  return toProduct(p, id);
});

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string) {
  return byId.get(id);
}

export function summarize(p: Product): ProductSummary {
  const { id, name, category, subcategory, brand, price, originalPrice, discount, rating, reviewCount, thumbnail, availability, stock, deliveryInfo, warranty, returnPolicy, sizeKind } = p;
  return { id, name, category, subcategory, brand, price, originalPrice, discount, rating, reviewCount, thumbnail, availability, stock, deliveryInfo, warranty, returnPolicy, sizeKind };
}

export function searchIndex(): SearchEntry[] {
  return products.map(({ id, name, brand, category, subcategory, thumbnail, price, tags }) => ({ id, name, brand, category, subcategory, thumbnail, price, tags }));
}

export function related(p: Product, n = 6) {
  const sameSub = products.filter((x) => x.id !== p.id && x.subcategory === p.subcategory);
  const sameDept = products.filter((x) => x.id !== p.id && x.category === p.category && x.subcategory !== p.subcategory);
  return [...sameSub, ...sameDept].slice(0, n);
}

export function trending(n = 8) {
  // Best rated in-stock item from each department in turn: a sane stand-in for
  // "popular" without fake sales numbers, and not a wall of groceries (which rate highest).
  const order = ["electronics", "accessories", "fashion", "beauty", "home", "sports", "pantry"];
  const best = order.map((d) => products.filter((p) => p.category === d && p.stock > 0).sort((a, b) => b.rating - a.rating || b.price - a.price));
  const out: Product[] = [];
  for (let i = 0; out.length < n && i < 50; i++) for (const list of best) if (list[i] && out.length < n) out.push(list[i]);
  return out;
}

export function deals(n = 8) {
  return [...products].filter((p) => p.discount && p.stock > 0).sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0)).slice(0, n);
}
