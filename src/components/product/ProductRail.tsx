import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductSummary } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/** A titled row: a grid on desktop, a swipeable strip on phones. */
export function ProductRail({ title, subtitle, href, products }: { title: string; subtitle?: string; href?: string; products: ProductSummary[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={`rail-${title}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={`rail-${title}`} className="text-xl font-bold sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline">
            See all <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="w-[64vw] max-w-[260px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ProductCard p={p} showCompare={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
