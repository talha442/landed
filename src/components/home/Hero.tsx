"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { destinations, estimateOne, money } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";

export function Hero({ showcase }: { showcase: ProductSummary[] }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  const setShipTo = useStore((s) => s.setShipTo);
  const [main, second, third] = showcase;
  const e = main ? estimateOne(main.price, dest) : null;

  return (
    <section className="container-page pt-6 sm:pt-10">
      <div className="grid items-center gap-10 overflow-hidden rounded-[28px] border bg-card px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:py-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            <span className="size-1.5 rounded-full bg-brand" /> Every price includes shipping and import
          </p>
          <h1 className="mt-5 max-w-xl text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-[56px]">The price you see is the price that lands.</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            No surprise fees at checkout, no switching currencies halfway through. Pick where it&apos;s going and every product shows what it
            really costs to get to your door.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/search">
                Start shopping <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/search?sort=discount">Today&apos;s deals</Link>
            </Button>
          </div>
          <div className="mt-8">
            <p className="text-xs font-medium text-muted-foreground">Showing prices delivered to</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Destination country">
              {destinations.map((d) => {
                const active = hydrated && d.code === dest.code;
                return (
                  <button
                    key={d.code}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setShipTo(d.code)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                      active ? "border-foreground bg-foreground font-semibold text-background" : "bg-card hover:border-foreground/40",
                    )}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Illustration: a real product and the receipt that explains its price. */}
        {main && (
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-5 grid-rows-2 gap-3">
              <Link href={`/product/${main.id}`} className="col-span-3 row-span-2 flex aspect-[3/4] items-center justify-center rounded-3xl bg-[#f3f2ee] p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={main.thumbnail} alt={main.name} className="max-h-full object-contain mix-blend-multiply" />
              </Link>
              {[second, third].filter(Boolean).map((p) => (
                <Link key={p!.id} href={`/product/${p!.id}`} className="col-span-2 flex items-center justify-center rounded-3xl bg-[#f3f2ee] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p!.thumbnail} alt={p!.name} className="max-h-full object-contain mix-blend-multiply" />
                </Link>
              ))}
            </div>
            <div className="absolute -bottom-4 left-2 w-60 rounded-2xl border bg-card p-4 text-sm shadow-xl shadow-black/10 sm:left-[-24px]">
              <p className="truncate text-xs font-medium text-muted-foreground">{main.name}</p>
              {!hydrated || !e ? (
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              ) : (
                <dl className="mt-2 space-y-1 tabular">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Item</dt>
                    <dd>{money(e.items, dest)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Shipping + {dest.code === "US" ? "tax" : "import"}</dt>
                    <dd>{money(e.shipping + e.duties, dest)}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-bold text-brand">
                    <dt>You pay</dt>
                    <dd>{money(e.total, dest)}</dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
