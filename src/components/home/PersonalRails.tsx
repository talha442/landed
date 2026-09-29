"use client";

import { ProductRail } from "@/components/product/ProductRail";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";

/**
 * "Recommended" without a recommendation engine: more from the department you looked
 * at last, falling back to deals. Honest about what it is.
 */
export function PersonalRails({ byDepartment, fallback }: { byDepartment: Record<string, ProductSummary[]>; fallback: ProductSummary[] }) {
  const hydrated = useHydrated();
  const viewed = useStore((s) => s.recentlyViewed);

  const lastDept = hydrated ? viewed[0]?.category : undefined;
  const seen = new Set(viewed.map((p) => p.id));
  const recommended = lastDept ? (byDepartment[lastDept] ?? []).filter((p) => !seen.has(p.id)).slice(0, 4) : fallback.slice(0, 4);

  return (
    <>
      <div className="container-page mt-16">
        <ProductRail
          title="Recommended for you"
          subtitle={lastDept ? `Because you looked at ${viewed[0].name}` : "Our biggest discounts right now"}
          href={lastDept ? `/search?category=${lastDept}` : "/search?sort=discount"}
          products={recommended.length ? recommended : fallback.slice(0, 4)}
        />
      </div>
      {hydrated && viewed.length > 0 && (
        <div className="container-page mt-16">
          <ProductRail title="Recently viewed" subtitle="Pick up where you left off" products={viewed.slice(0, 4)} />
        </div>
      )}
    </>
  );
}
