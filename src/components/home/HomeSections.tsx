import { ArrowRight, Boxes, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Department } from "@/lib/catalog-meta";

const PROMISES = [
  { icon: ReceiptText, title: "Delivered prices", body: "Shipping and import charges are in every price you see, in your currency." },
  { icon: Boxes, title: "One box, one fee", body: "Shipping is charged per box, so adding a second item costs a fraction of the first." },
  { icon: ShieldCheck, title: "Checkout in four steps", body: "Address, delivery, payment, review. The total never changes along the way." },
];

export function Promises() {
  return (
    <section aria-label="How Landed works" className="container-page mt-12 grid gap-3 sm:grid-cols-3">
      {PROMISES.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3.5 rounded-2xl border bg-card p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function CategoryGrid({ items }: { items: { dept: Department; image: string; count: number }[] }) {
  return (
    <section aria-labelledby="cats" className="container-page mt-16">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 id="cats" className="text-xl font-bold sm:text-2xl">
            Shop by department
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Seven departments, no maze.</p>
        </div>
        <Link href="/search" className="hidden items-center gap-1 text-sm font-semibold hover:underline sm:flex">
          All products <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {items.map(({ dept, image, count }, i) => (
          <Link
            key={dept.slug}
            href={`/search?category=${dept.slug}`}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-black/5 ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
          >
            <div className="relative z-10">
              <p className="font-heading text-base font-bold sm:text-lg">{dept.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{count} products</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              loading="lazy"
              className={`mx-auto mt-2 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 ${i === 0 ? "aspect-square w-4/5" : "aspect-[4/3] w-3/4"}`}
            />
          </Link>
        ))}
        <Link href="/search?sort=discount" className="flex flex-col justify-between rounded-2xl bg-foreground p-4 text-background transition-opacity hover:opacity-90">
          <p className="font-heading text-base font-bold sm:text-lg">Deals</p>
          <p className="text-sm text-background/70">Up to 20% off, delivered prices included.</p>
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}

export function BundlePromo() {
  return (
    <section className="container-page mt-16">
      <div className="grid overflow-hidden rounded-[28px] bg-foreground text-background md:grid-cols-[1.2fr_1fr]">
        <div className="p-8 sm:p-10">
          <p className="text-xs font-semibold tracking-wide text-background/60 uppercase">Why ordering together is cheaper</p>
          <h2 className="mt-3 max-w-md text-3xl leading-tight font-extrabold">Shipping is per box, not per item.</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-background/70">
            Most stores show a delivery fee on every listing, so two items look like two fees. Landed charges the box once and a small amount per
            extra item, and your cart shows exactly how much you saved by ordering together.
          </p>
          <Link href="/search?sort=discount" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-background px-5 text-sm font-semibold text-foreground hover:bg-background/90">
            Fill a box with deals <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-xs space-y-2 rounded-2xl bg-background/10 p-5 text-sm tabular">
            <p className="text-xs text-background/60">Example: to Pakistan</p>
            <div className="flex justify-between"><span>Ordered separately</span><span className="line-through opacity-60">2 × box fee</span></div>
            <div className="flex justify-between"><span>Ordered together</span><span className="font-bold">1 box fee</span></div>
            <div className="flex justify-between border-t border-background/20 pt-2 text-base font-bold text-[#8fe0bf]"><span>You save</span><span>≈ PKR 11,000</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
