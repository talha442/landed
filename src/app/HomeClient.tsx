"use client";

import { ProductCard } from "@/components/ProductCard";
import { destinations } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";

export function HeroDestination() {
  const dest = useDestination();
  const setShipTo = useStore((s) => s.setShipTo);
  const hydrated = useHydrated();
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-[#ccc]">Showing prices delivered to</span>
      {destinations.map((d) => (
        <button
          key={d.code}
          onClick={() => setShipTo(d.code)}
          aria-pressed={hydrated && d.code === dest.code}
          className={`rounded-full border px-3 py-1 transition-colors ${
            hydrated && d.code === dest.code ? "border-[#febd69] bg-[#febd69] font-bold text-ink" : "border-white/30 hover:border-white"
          }`}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
}

export function RecentlyViewed({ catalog }: { catalog: ProductSummary[] }) {
  const ids = useStore((s) => s.recentlyViewed);
  const hydrated = useHydrated();
  if (!hydrated || ids.length === 0) return null;
  const items = ids.map((id) => catalog.find((p) => p.id === id)).filter((p): p is ProductSummary => !!p).slice(0, 6);
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-xl font-bold">Pick up where you left off</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
