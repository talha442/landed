import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

const GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4";

export function ProductGrid({ products, className, priorityCount = 4 }: { products: ProductSummary[]; className?: string; priorityCount?: number }) {
  return (
    <div className={cn(GRID, className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} p={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden>
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(GRID, className)} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
