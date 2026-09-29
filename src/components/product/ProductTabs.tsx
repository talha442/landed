"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Stars } from "./ProductRating";

/**
 * Description, specs and reviews as tabs right under the buy box. On amazon.com,
 * reviews start about five screens down, behind carousels, and need a sign-in.
 */
export function ProductTabs({ product: p }: { product: Product }) {
  return (
    <Tabs defaultValue="overview" className="gap-6" id="details">
      <TabsList variant="line" className="w-full justify-start gap-6 border-b p-0 group-data-horizontal/tabs:h-11">
        <TabsTrigger value="overview" className="flex-none px-0 pb-2 text-[15px]">Overview</TabsTrigger>
        <TabsTrigger value="specs" className="flex-none px-0 pb-2 text-[15px]">Specifications</TabsTrigger>
        <TabsTrigger value="reviews" className="flex-none px-0 pb-2 text-[15px]">
          Reviews <span className="text-muted-foreground">({p.reviewCount})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="max-w-3xl">
        <p className="text-[15px] leading-relaxed">{p.description}</p>
        <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Ships from seller", p.deliveryInfo.replace(/^Ships /, "")],
            ["Returns", p.returnPolicy],
            ["Warranty", p.warranty],
            ["Category", p.subcategory],
          ].map(([k, v]) => (
            <li key={k} className="rounded-xl bg-muted/60 px-3.5 py-2.5">
              <span className="block text-xs text-muted-foreground">{k}</span>
              <span className="font-semibold">{v}</span>
            </li>
          ))}
        </ul>
        {p.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <a key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full border bg-card px-3 py-1 text-xs capitalize hover:border-foreground/40">
                {t}
              </a>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="specs" className="max-w-3xl">
        <dl className="divide-y overflow-hidden rounded-2xl border bg-card text-sm">
          {Object.entries(p.specifications).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 sm:grid-cols-[200px_1fr]">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </TabsContent>

      <TabsContent value="reviews">
        <Reviews product={p} />
      </TabsContent>
    </Tabs>
  );
}

function Reviews({ product: p }: { product: Product }) {
  const [filter, setFilter] = useState<number | null>(null);
  const reviews = p.reviews;
  const counts = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => Math.round(r.rating) === s).length }));
  const positive = reviews.filter((r) => r.rating >= 4).length;
  const critical = reviews.filter((r) => r.rating <= 2).length;
  const list = reviews.filter((r) => filter === null || Math.round(r.rating) === filter).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <div>
        <p className="font-heading text-5xl font-extrabold tabular">{p.rating.toFixed(1)}</p>
        <Stars rating={p.rating} className="size-5" />
        <p className="mt-1 text-sm text-muted-foreground">
          Based on {p.reviewCount} {p.reviewCount === 1 ? "review" : "reviews"}
        </p>
        <ul className="mt-4 space-y-1.5">
          {counts.map(({ s, n }) => (
            <li key={s}>
              <button
                disabled={n === 0}
                onClick={() => setFilter(filter === s ? null : s)}
                aria-pressed={filter === s}
                className={cn("flex w-full items-center gap-2.5 rounded-md px-1 py-0.5 text-sm hover:bg-muted disabled:pointer-events-none disabled:opacity-40", filter === s && "bg-muted font-semibold")}
              >
                <span className="w-3 tabular">{s}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-star" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
                </span>
                <span className="w-4 text-right text-muted-foreground tabular">{n}</span>
              </button>
            </li>
          ))}
        </ul>
        {reviews.length > 0 && (
          <p className="mt-4 rounded-xl bg-muted/60 p-3 text-sm leading-relaxed">
            <span className="font-semibold">At a glance:</span> {positive} of {reviews.length} rate it 4 stars or more
            {critical > 0 ? `, ${critical} ${critical === 1 ? "is" : "are"} critical. Worth reading before you buy.` : ", and none are critical."}
          </p>
        )}
      </div>
      <div>
        {filter !== null && (
          <p className="mb-3 text-sm text-muted-foreground">
            Showing {filter}-star reviews ·{" "}
            <button className="font-semibold text-foreground hover:underline" onClick={() => setFilter(null)}>
              Show all
            </button>
          </p>
        )}
        <ul className="space-y-3">
          {list.map((r, i) => (
            <li key={i} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold" aria-hidden>
                    {r.reviewerName
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </span>
                  <span className="text-sm font-semibold">{r.reviewerName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <Stars rating={r.rating} />
                <p className="text-sm font-semibold">{r.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
