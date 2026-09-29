"use client";

import { useState } from "react";
import { Stars } from "@/components/Stars";
import type { Review } from "@/lib/types";

/** On amazon.com reviews start ~5 screens down and need a sign-in. Here they're open to everyone. */
export function Reviews({ rating, reviews }: { rating: number; reviews: Review[] }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<"recent" | "high" | "low">("recent");

  const counts = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => r.rating === s).length }));
  const critical = reviews.filter((r) => r.rating <= 2).length;
  const positive = reviews.filter((r) => r.rating >= 4).length;

  const list = reviews
    .filter((r) => filter === null || r.rating === filter)
    .sort((a, b) => (sort === "high" ? b.rating - a.rating : sort === "low" ? a.rating - b.rating : b.date.localeCompare(a.date)));

  return (
    <section id="reviews" className="card scroll-mt-32 p-4 lg:p-6" aria-labelledby="reviews-h">
      <h2 id="reviews-h" className="text-lg font-bold">
        Customer reviews
      </h2>
      <div className="mt-3 grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <Stars rating={rating} className="size-5" />
            <span className="text-lg">{rating.toFixed(1)} out of 5</span>
          </div>
          <p className="mt-1 text-sm text-subtle">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
          <ul className="mt-3 space-y-1.5">
            {counts.map(({ s, n }) => (
              <li key={s}>
                <button
                  disabled={n === 0}
                  onClick={() => setFilter(filter === s ? null : s)}
                  className={`group flex w-full items-center gap-2 text-sm disabled:cursor-default disabled:opacity-50 ${filter === s ? "font-bold" : ""}`}
                  aria-pressed={filter === s}
                >
                  <span className="w-11 text-left text-link group-enabled:group-hover:underline">{s} star</span>
                  <span className="h-4 flex-1 overflow-hidden rounded border border-[#e3e6e6] bg-[#f0f2f2]">
                    <span className="block h-full bg-star" style={{ width: `${reviews.length ? (n / reviews.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-5 text-right text-subtle">{n}</span>
                </button>
              </li>
            ))}
          </ul>
          {reviews.length > 0 && (
            <p className="mt-4 rounded-md bg-[#f7f8f8] p-3 text-sm">
              <span className="font-bold">At a glance:</span> {positive} of {reviews.length} reviewers rate it 4★ or higher
              {critical > 0 ? `, and ${critical} ${critical === 1 ? "is" : "are"} critical. Read the critical ones before you buy.` : ", with no critical reviews."}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-subtle">
              {filter ? `Showing ${filter}-star reviews` : "Showing all reviews"}
              {filter && (
                <button className="link ml-2" onClick={() => setFilter(null)}>
                  Show all
                </button>
              )}
            </p>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-md border border-line bg-[#f0f2f2] px-2 py-1 text-sm" aria-label="Sort reviews">
              <option value="recent">Most recent</option>
              <option value="high">Highest rated</option>
              <option value="low">Lowest rated</option>
            </select>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {list.map((r, i) => (
              <li key={i} className="py-4 first:pt-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#e3e6e6] text-xs font-bold text-subtle" aria-hidden>
                    {r.reviewerName
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </span>
                  <span>{r.reviewerName}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Stars rating={r.rating} className="size-3.5" />
                  <span className="text-sm font-bold">{r.comment}</span>
                </div>
                <p className="mt-0.5 text-xs text-subtle">
                  Reviewed {new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
