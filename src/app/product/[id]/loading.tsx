import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-6" role="status" aria-label="Loading product">
      <Skeleton className="h-4 w-56" />
      <div className="mt-5 grid gap-8 md:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-6 h-12 w-48" />
          <Skeleton className="h-28 w-full max-w-sm rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
