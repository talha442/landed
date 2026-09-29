import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className={cn("relative size-3.5", className)}>
            <Star className="absolute inset-0 size-full fill-border text-border" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("size-3.5 fill-star text-star", className)} strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function ProductRating({ rating, count, className, size = "sm" }: { rating: number; count?: number; className?: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", size === "md" ? "text-sm" : "text-xs", className)}>
      <span className="font-semibold tabular">{rating.toFixed(1)}</span>
      <Stars rating={rating} className={size === "md" ? "size-4" : undefined} />
      {count !== undefined && (
        <span className="text-muted-foreground">
          ({count}
          <span className={size === "md" ? "" : "hidden sm:inline"}> {count === 1 ? "review" : "reviews"}</span>)
        </span>
      )}
    </span>
  );
}
