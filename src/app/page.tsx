import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { categoryName, departments, products, summarize } from "@/lib/catalog";
import { HeroDestination, RecentlyViewed } from "./HomeClient";

export default function Home() {
  const deals = [...products].sort((a, b) => b.discountPercentage - a.discountPercentage).slice(0, 6);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const catalog = products.map(summarize);

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4">
      <section className="overflow-hidden rounded-lg bg-gradient-to-br from-[#232f3e] to-[#37475a] px-6 py-8 text-white sm:px-10 sm:py-12">
        <p className="text-sm font-medium tracking-wide text-[#febd69] uppercase">The price is the price</p>
        <h1 className="mt-2 max-w-2xl text-3xl leading-tight font-bold sm:text-4xl">What you see is what you pay, delivered.</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-[#ddd]">
          Every price here already includes shipping and import charges, in your currency. The number on the product is the number at
          checkout.
        </p>
        <HeroDestination />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Departments">
        {departments.map((d) => {
          const items = products.filter((p) => (d.categories as readonly string[]).includes(p.category));
          const tiles = d.categories.map((c) => items.find((p) => p.category === c)!).filter(Boolean).slice(0, 4);
          return (
            <div key={d.slug} className="card flex flex-col p-4">
              <h2 className="text-lg font-bold">{d.name}</h2>
              <div className="mt-3 grid flex-1 grid-cols-2 gap-3">
                {tiles.map((p) => (
                  <Link key={p.id} href={`/s?q=${encodeURIComponent(categoryName(p.category))}&dept=${d.slug}`} className="group">
                    <div className="rounded bg-[#f7f8f8] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.thumbnail} alt="" loading="lazy" className="aspect-square w-full object-contain mix-blend-multiply" />
                    </div>
                    <p className="mt-1 text-xs group-hover:underline">{categoryName(p.category)}</p>
                  </Link>
                ))}
              </div>
              <Link href={`/s?dept=${d.slug}`} className="link mt-3 text-sm">
                Shop {items.length} items
              </Link>
            </div>
          );
        })}
        <div className="card flex flex-col justify-between bg-[#fff8e7] p-4">
          <div>
            <h2 className="text-lg font-bold">Sort by what you&apos;ll actually pay</h2>
            <p className="mt-2 text-sm text-subtle">
              Cheapest item and cheapest delivered aren&apos;t always the same thing. Sort everything by total cost, fees included.
            </p>
          </div>
          <Link href="/s?sort=total" className="btn-cta mt-4 self-start">
            Lowest total cost
          </Link>
        </div>
      </section>

      <RecentlyViewed catalog={catalog} />

      <Row title="Today's biggest discounts" href="/s?sort=discount">
        {deals.map((p) => (
          <ProductCard key={p.id} p={summarize(p)} />
        ))}
      </Row>
      <Row title="Top rated" href="/s?sort=rating">
        {topRated.map((p) => (
          <ProductCard key={p.id} p={summarize(p)} />
        ))}
      </Row>
    </div>
  );
}

function Row({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={href} className="link text-sm">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{children}</div>
    </section>
  );
}
