"use client";

import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { estimate, estimateOne, money, type Destination } from "@/lib/shipping";
import { useHydrated } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";

/**
 * "PKR 23,462" with the currency small and the number big. Always the delivered total.
 */
export function Amount({ usd, dest, className }: { usd: number; dest: Destination; className?: string }) {
  const text = money(usd, dest);
  const m = text.match(/^([A-Z]{3} |\$)(.*)$/);
  const [cur, num] = m ? [m[1].trim(), m[2]] : ["", text];
  return (
    <span className={cn("inline-flex items-baseline gap-0.5 font-heading font-bold tracking-tight tabular", className)}>
      <span className="text-[0.55em] font-semibold">{cur}</span>
      <span>{num}</span>
    </span>
  );
}

/** Card version: delivered total, was-price, discount, and what's included in one line. */
export function CardPrice({ price, originalPrice, discount }: { price: number; originalPrice?: number; discount?: number }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="space-y-1.5" aria-hidden>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    );
  }
  const e = estimateOne(price, dest);
  const was = originalPrice ? estimateOne(originalPrice, dest).total : null;
  const fees = e.shipping + e.duties;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <Amount usd={e.total} dest={dest} className="text-xl" />
        {was && <span className="text-xs text-muted-foreground line-through tabular">{money(was, dest)}</span>}
        {discount && <span className="rounded-md bg-sale/10 px-1.5 py-0.5 text-[11px] font-bold text-sale">-{discount}%</span>}
      </div>
      <p className="mt-0.5 text-xs text-brand">{fees > 0 ? "Delivered price · fees included" : "Delivered price · free shipping"}</p>
    </div>
  );
}

/** Product page version: the total leads, and the breakdown is visible, not hidden behind "Details". */
export function PriceBreakdown({ price, originalPrice, discount, qty = 1 }: { price: number; originalPrice?: number; discount?: number; qty?: number }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="space-y-2" aria-hidden>
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-24 w-full max-w-sm" />
      </div>
    );
  }
  const e = estimate([{ price, qty }], dest);
  const was = originalPrice ? estimate([{ price: originalPrice, qty }], dest).total : null;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Amount usd={e.total} dest={dest} className="text-4xl" />
        {was && <span className="text-base text-muted-foreground line-through tabular">{money(was, dest)}</span>}
        {discount && <span className="rounded-md bg-sale/10 px-2 py-0.5 text-sm font-bold text-sale">Save {discount}%</span>}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-brand">
        Delivered to {dest.name}{qty > 1 ? ` for ${qty}` : ""}. Nothing extra at checkout.
      </p>
      <dl className="mt-4 max-w-sm space-y-1.5 rounded-xl border bg-muted/40 p-3.5 text-sm">
        <Row label={qty > 1 ? `Items (${qty})` : "Item"} value={money(e.items, dest)} />
        <Row
          label="Shipping"
          value={e.shipping ? money(e.shipping, dest) : "Free"}
          hint={
            dest.perItem > 0
              ? `Charged per box: ${money(dest.shipping.standard.perShipment, dest)} + ${money(dest.perItem, dest)} per item. Order things together and you pay the box fee once.`
              : dest.freeShippingOver
                ? `Free on orders over ${money(dest.freeShippingOver, dest)}.`
                : undefined
          }
        />
        <Row label={`${dest.dutyLabel} (est.)`} value={money(e.duties, dest)} hint={`Estimated at ${Math.round(dest.dutyRate * 100)}% of the item value and collected at checkout, so there's nothing to pay on the doorstep.`} />
        <div className="flex justify-between border-t pt-2 font-semibold">
          <dt>You pay</dt>
          <dd className="tabular">{money(e.total, dest)}</dd>
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="flex items-center gap-1 text-muted-foreground">
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="rounded-full text-muted-foreground/70 hover:text-foreground" aria-label={`About ${label.toLowerCase()}`}>
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64 text-xs leading-relaxed">{hint}</TooltipContent>
          </Tooltip>
        )}
      </dt>
      <dd className="tabular">{value}</dd>
    </div>
  );
}
