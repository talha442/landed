// One-off: snapshot the DummyJSON catalog into the repo so the live site has no
// runtime dependency on a third-party API or CDN.
//   node scripts/build-catalog.mjs
// Writes src/data/products.json and public/img/p/<id>/{thumb,1,2,...}.webp

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMG_DIR = path.join(ROOT, "public", "img", "p");
const OUT = path.join(ROOT, "src", "data", "products.json");

// Not things you'd buy on Amazon and have shipped to your door.
const SKIP_CATEGORIES = new Set(["vehicle", "motorcycle"]);

const res = await fetch("https://dummyjson.com/products?limit=0");
const { products } = await res.json();
const keep = products.filter((p) => !SKIP_CATEGORIES.has(p.category));

async function saveImage(url, file, width) {
  try {
    await fs.access(file);
    return true; // already downloaded
  } catch {}
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      const buf = Buffer.from(await r.arrayBuffer());
      await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(file);
      return true;
    } catch (e) {
      if (attempt === 2) {
        console.error("failed", url, e.message);
        return false;
      }
    }
  }
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

const out = [];
await pool(keep, 8, async (p) => {
  const dir = path.join(IMG_DIR, String(p.id));
  await fs.mkdir(dir, { recursive: true });
  const images = [];
  for (const [i, url] of p.images.entries()) {
    if (await saveImage(url, path.join(dir, `${i + 1}.webp`), 900)) images.push(`/img/p/${p.id}/${i + 1}.webp`);
  }
  const thumbOk = await saveImage(p.thumbnail, path.join(dir, "thumb.webp"), 360);
  out.push({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    brand: p.brand ?? null,
    price: p.price, // USD, the seller's price before shipping and import
    discountPercentage: p.discountPercentage,
    rating: p.rating,
    stock: p.stock,
    tags: p.tags,
    sku: p.sku,
    weight: p.weight,
    dimensions: p.dimensions,
    warranty: p.warrantyInformation,
    shippingInformation: p.shippingInformation,
    returnPolicy: p.returnPolicy,
    // Reviewer emails dropped: not needed, and not ours to republish.
    reviews: p.reviews.map(({ rating, comment, date, reviewerName }) => ({ rating, comment, date, reviewerName })),
    thumbnail: thumbOk ? `/img/p/${p.id}/thumb.webp` : images[0],
    images,
  });
  process.stdout.write(".");
});

out.sort((a, b) => a.id - b.id);
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(out, null, 1));
console.log(`\n${out.length} products written to ${path.relative(ROOT, OUT)}`);
