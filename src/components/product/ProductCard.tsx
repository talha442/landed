"use client";

import { Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deliveryWindow, formatWindow } from "@/lib/shipping";
import { MAX_COMPARE, useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { CardPrice } from "./PriceDisplay";
import { ProductRating } from "./ProductRating";
import { WishlistToggle } from "./WishlistToggle";

/**
 * Amazon's cards stack sponsored labels, coupons, "bought in past month", list price,
 * per-count price and a separate delivery fee. This card answers four questions in
 * order: what is it, is it good, what will I pay, when will it arrive.
 */
export function ProductCard({ p, priority = false, showCompare = true }: { p: ProductSummary; priority?: boolean; showCompare?: boolean }) {
  const outOfStock = p.stock === 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg hover:shadow-black/5">
      <Link href={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-[#f3f2ee]" tabIndex={-1} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized local webp */}
        <img
          src={p.thumbnail}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className={cn("size-full object-contain p-5 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04]", outOfStock && "opacity-50")}
        />
        {p.discount && <span className="absolute top-3 left-3 rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-white">-{p.discount}%</span>}
        {p.availability === "Low stock" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-warning ring-1 ring-black/5">Only {p.stock} left</span>
        )}
      </Link>
      <WishlistToggle productId={p.id} name={p.name} className="absolute top-2.5 right-2.5 z-10" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="truncate text-xs font-medium text-muted-foreground">{p.brand ?? p.subcategory}</p>
        <h3 className="-mt-1 text-[15px] leading-snug font-semibold">
          <Link href={`/product/${p.id}`} className="line-clamp-2 after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none">
            {p.name}
          </Link>
        </h3>
        <ProductRating rating={p.rating} count={p.reviewCount} />
        <CardPrice price={p.price} originalPrice={p.originalPrice} discount={p.discount} />
        <DeliveryLine deliveryInfo={p.deliveryInfo} />

        {/* Controls sit above the card-wide link overlay. */}
        <div className="relative z-10 mt-auto flex flex-col gap-2 pt-2">
          {outOfStock ? (
            <Button variant="secondary" disabled className="w-full">
              Out of stock
            </Button>
          ) : p.sizeKind ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/product/${p.id}`}>Choose size</Link>
            </Button>
          ) : (
            <AddToCartButton productId={p.id} name={p.name} className="w-full" />
          )}
          {showCompare && <CompareCheckbox p={p} />}
        </div>
      </div>
    </article>
  );
}

function DeliveryLine({ deliveryInfo }: { deliveryInfo: string }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  if (!hydrated) return <p className="h-4" />;
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Truck className="size-3.5 shrink-0" aria-hidden />
      <span>
        Arrives <span className="font-semibold text-foreground">{formatWindow(deliveryWindow(deliveryInfo, dest))}</span>
      </span>
    </p>
  );
}

function CompareCheckbox({ p }: { p: ProductSummary }) {
  const hydrated = useHydrated();
  const checked = useStore((s) => s.compare.some((x) => x.id === p.id));
  const toggle = useStore((s) => s.toggleCompare);
  const id = `compare-${p.id}`;
  return (
    <label htmlFor={id} className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none hover:text-foreground">
      <Checkbox
        id={id}
        checked={hydrated && checked}
        onCheckedChange={() => {
          if (!toggle(p)) toast(`You can compare up to ${MAX_COMPARE} items`, { description: "Remove one from the tray first." });
        }}
      />
      Compare
    </label>
  );
}
