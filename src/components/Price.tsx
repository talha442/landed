"use client";

import { deliveryWindow, estimateOne, formatWindow, money } from "@/lib/shipping";
import { useHydrated } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";

/** Splits "PKR 23,462" into a small currency code and a big number, like Amazon's price style. */
export function Amount({ usd, className = "text-2xl" }: { usd: number; className?: string }) {
  const dest = useDestination();
  const text = money(usd, dest);
  const m = text.match(/^([A-Z]{3} |\$)(.*)$/);
  const [cur, num] = m ? [m[1].trim(), m[2]] : ["", text];
  const [whole, frac] = num.split(".");
  return (
    <span className={`inline-flex items-start leading-none font-medium ${className}`}>
      <span className="mt-[0.15em] mr-0.5 text-[0.5em]">{cur}</span>
      <span>{whole}</span>
      {frac && <span className="mt-[0.15em] text-[0.5em]">{frac}</span>}
    </span>
  );
}

/** The card/list version: delivered total first, the split underneath. */
export function DeliveredPrice({ price, discount, shippingInformation }: { price: number; discount?: number; shippingInformation: string }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  if (!hydrated) return <PriceSkeleton />;
  const e = estimateOne(price, dest);
  const extra = e.shipping + e.duties;
  const w = deliveryWindow(shippingInformation, dest);
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-2">
        {discount !== undefined && discount >= 10 && <span className="text-sm font-medium text-deal">-{Math.round(discount)}%</span>}
        <Amount usd={e.total} className="text-[26px]" />
      </div>
      <p className="text-xs text-subtle">
        {extra > 0 ? (
          <>
            {money(e.items, dest)} item + {money(extra, dest)} {dest.code === "US" ? "shipping & tax" : "shipping & import"}
          </>
        ) : (
          <>Includes free delivery</>
        )}
      </p>
      <p className="text-xs">
        Delivered <span className="font-bold">{formatWindow(w)}</span>
      </p>
    </div>
  );
}

export function PriceSkeleton() {
  return (
    <div className="space-y-1.5" aria-hidden>
      <div className="skeleton h-7 w-28" />
      <div className="skeleton h-3 w-40" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}
