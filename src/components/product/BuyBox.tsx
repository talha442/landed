"use client";

import { Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { deliveryWindow, formatWindow } from "@/lib/shipping";
import { MAX_QTY, useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { PriceBreakdown } from "./PriceDisplay";
import { SizePicker } from "./SizePicker";
import { WishlistToggle } from "./WishlistToggle";

export function BuyBox({ product: p }: { product: ProductSummary }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  const router = useRouter();
  const viewed = useStore((s) => s.viewed);
  const add = useStore((s) => s.addToCart);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const inStock = p.stock > 0;
  const maxQty = Math.min(MAX_QTY, p.stock);

  useEffect(() => viewed(p), [p, viewed]);

  function needsSize() {
    if (p.sizeKind && !size) {
      setSizeError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  return (
    <div className="space-y-6">
      <PriceBreakdown price={p.price} originalPrice={p.originalPrice} discount={p.discount} qty={qty} />

      {p.sizeKind && (
        <SizePicker
          kind={p.sizeKind}
          value={size}
          error={sizeError}
          onChange={(s) => {
            setSize(s);
            setSizeError(false);
          }}
        />
      )}

      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Availability stock={p.stock} />
          {hydrated ? (
            <p className="flex items-center gap-1.5 text-sm">
              <Truck className="size-4 text-muted-foreground" />
              Arrives <span className="font-semibold">{formatWindow(deliveryWindow(p.deliveryInfo, dest))}</span>
            </p>
          ) : (
            <Skeleton className="h-4 w-40" />
          )}
        </div>

        {inStock && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-full border bg-background" role="group" aria-label="Quantity">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="flex size-12 items-center justify-center rounded-l-full hover:bg-muted disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span key={qty} className="w-8 animate-in text-center font-semibold tabular zoom-in-75" aria-live="polite">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  className="flex size-12 items-center justify-center rounded-r-full hover:bg-muted disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <AddToCartButton productId={p.id} name={p.name} qty={qty} size={size ?? undefined} beforeAdd={needsSize} buttonSize="lg" className="min-w-0 flex-1" />
            </div>
            <div className="mt-3 flex gap-3">
              <Button
                size="lg"
                variant="brand"
                className="flex-1"
                onClick={() => {
                  if (!needsSize()) return;
                  add(p.id, qty, size ?? undefined);
                  router.push("/checkout");
                }}
              >
                Buy now
              </Button>
              <WishlistToggle productId={p.id} name={p.name} variant="button" />
            </div>
          </>
        )}
        {!inStock && (
          <div className="mt-4 flex gap-3">
            <WishlistToggle productId={p.id} name={p.name} variant="button" className="flex-1" />
          </div>
        )}
      </div>

      <ul className="grid gap-3 text-sm sm:grid-cols-2">
        <li className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3">
          <RotateCcw className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-semibold">Returns</span>
            <span className="text-muted-foreground">{p.returnPolicy}</span>
          </span>
        </li>
        <li className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="block font-semibold">Warranty</span>
            <span className="text-muted-foreground">{p.warranty}</span>
          </span>
        </li>
      </ul>
    </div>
  );
}

function Availability({ stock }: { stock: number }) {
  const [label, tone] = stock === 0 ? ["Out of stock", "bg-muted-foreground"] : stock <= 5 ? [`Only ${stock} left`, "bg-warning"] : ["In stock", "bg-brand"];
  return (
    <p className={cn("flex items-center gap-2 text-sm font-semibold", stock === 0 ? "text-muted-foreground" : stock <= 5 ? "text-warning" : "text-brand")}>
      <span className={cn("size-2 rounded-full", tone)} />
      {label}
    </p>
  );
}
