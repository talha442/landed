import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-6 flex gap-8">
        <div className="hidden w-60 shrink-0 space-y-4 lg:block">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <ProductGridSkeleton count={12} className="flex-1" />
      </div>
    </div>
  );
}
