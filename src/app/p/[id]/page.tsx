import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { Stars } from "@/components/Stars";
import { categoryName, departmentOf, getProduct, products, related, sizeKind, summarize } from "@/lib/catalog";
import { Gallery } from "./Gallery";
import { Purchase } from "./Purchase";
import { Reviews } from "./Reviews";
import { TrackView } from "./TrackView";

export function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const p = getProduct(Number((await params).id));
  return p ? { title: p.title, description: p.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/p/[id]">) {
  const p = getProduct(Number((await params).id));
  if (!p) notFound();
  const dept = departmentOf(p.category);

  const specs: [string, string][] = [
    ["Brand", p.brand ?? "Generic"],
    ["Category", categoryName(p.category)],
    ["Item weight", `${p.weight} kg`],
    ["Dimensions", `${p.dimensions.width} × ${p.dimensions.height} × ${p.dimensions.depth} cm`],
    ["Warranty", p.warranty],
    ["Returns", p.returnPolicy],
    ["Dispatch", p.shippingInformation],
    ["SKU", p.sku],
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4">
      <TrackView id={p.id} />
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <ol className="flex flex-wrap items-center gap-1">
          {dept && (
            <li>
              <Link href={`/s?dept=${dept.slug}`} className="hover:underline">
                {dept.name}
              </Link>{" "}
              ›
            </li>
          )}
          <li>
            <Link href={`/s?q=${encodeURIComponent(categoryName(p.category))}${dept ? `&dept=${dept.slug}` : ""}`} className="hover:underline">
              {categoryName(p.category)}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="card grid gap-6 p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:p-6">
        <Gallery images={p.images.length ? p.images : [p.thumbnail]} title={p.title} />
        <div className="min-w-0">
          <p className="text-sm">
            {p.brand ? (
              <Link href={`/s?q=${encodeURIComponent(p.brand)}`} className="link">
                Visit the {p.brand} store
              </Link>
            ) : (
              <span className="text-subtle">{categoryName(p.category)}</span>
            )}
          </p>
          <h1 className="mt-1 text-2xl leading-tight font-medium">{p.title}</h1>
          <a href="#reviews" className="mt-2 inline-flex items-center gap-1.5 text-sm">
            <span>{p.rating.toFixed(1)}</span>
            <Stars rating={p.rating} />
            <span className="link">
              {p.reviews.length} {p.reviews.length === 1 ? "review" : "reviews"}
            </span>
          </a>
          <hr className="my-4 border-line" />
          <Purchase
            product={{
              id: p.id,
              title: p.title,
              price: p.price,
              discountPercentage: p.discountPercentage,
              stock: p.stock,
              shippingInformation: p.shippingInformation,
              returnPolicy: p.returnPolicy,
              warranty: p.warranty,
              brand: p.brand,
              sizeKind: sizeKind(p.category),
            }}
          />
          <section className="mt-6">
            <h2 className="text-lg font-bold">About this item</h2>
            <p className="mt-2 text-[15px] leading-relaxed">{p.description}</p>
            {p.tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li key={t}>
                    <Link href={`/s?q=${encodeURIComponent(t)}`} className="rounded-full bg-[#f0f2f2] px-3 py-1 text-xs hover:bg-[#e3e6e6]">
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="card p-4 lg:p-6" aria-labelledby="specs">
          <h2 id="specs" className="text-lg font-bold">
            Product details
          </h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <th scope="row" className="w-36 bg-[#f7f8f8] px-3 py-2 text-left font-medium">
                    {k}
                  </th>
                  <td className="px-3 py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <Reviews rating={p.rating} reviews={p.reviews} />
      </div>

      <section className="mt-4" aria-labelledby="related">
        <h2 id="related" className="mb-3 text-lg font-bold">
          More like this
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {related(p).map((r) => (
            <ProductCard key={r.id} p={summarize(r)} />
          ))}
        </div>
      </section>
    </div>
  );
}
