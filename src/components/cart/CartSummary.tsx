"use client";

import { ArrowRight, Lock, PiggyBank, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { bundlingSaving, estimate, formatWindow, money, orderDeliveryWindow, type Speed } from "@/lib/shipping";
import type { ResolvedLine } from "@/lib/useCartLines";
import { useDestination } from "@/lib/useDestination";

/** Shared by the cart and checkout, so the two can never disagree about the total. */
export function OrderTotals({ lines, speed = "standard" }: { lines: ResolvedLine[]; speed?: Speed }) {
  const dest = useDestination();
  const e = estimate(
    lines.map((l) => ({ price: l.product.price, qty: l.qty })),
    dest,
    speed,
  );
  return (
    <dl className="space-y-2 text-sm">
      <Line label={`Items (${e.itemCount})`} value={money(e.items, dest)} />
      <Line label={`Shipping to ${dest.name}`} value={e.shipping ? money(e.shipping, dest) : "Free"} />
      <Line label={`${dest.dutyLabel} (est.)`} value={money(e.duties, dest)} />
      <div className="mt-3 flex items-baseline justify-between border-t pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="font-heading text-2xl font-extrabold tabular">{money(e.total, dest)}</dd>
      </div>
    </dl>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular">{value}</dd>
    </div>
  );
}

export function CartSummary({ lines }: { lines: ResolvedLine[] }) {
  const dest = useDestination();
  const cost = lines.map((l) => ({ price: l.product.price, qty: l.qty }));
  const e = estimate(cost, dest);
  const saving = bundlingSaving(cost, dest);
  const w = orderDeliveryWindow(
    lines.map((l) => l.product.deliveryInfo),
    dest,
  );
  const toFree = dest.freeShippingOver !== null && !e.freeShipping ? dest.freeShippingOver - e.items : 0;

  return (
    <aside className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6 lg:sticky lg:top-32" aria-label="Order summary">
      <h2 className="font-heading text-lg font-bold">Order summary</h2>
      {toFree > 0 && (
        <div className="rounded-2xl bg-brand-soft p-3.5 text-sm">
          <p>
            Add <span className="font-bold">{money(toFree, dest)}</span> more for free shipping.
          </p>
          <Progress value={(e.items / dest.freeShippingOver!) * 100} className="mt-2.5 h-1.5 bg-brand/15 [&>div]:bg-brand" aria-label="Progress to free shipping" />
        </div>
      )}
      <OrderTotals lines={lines} />
      {saving > 0.005 && (
        <p className="flex gap-2.5 rounded-2xl bg-brand-soft p-3.5 text-sm text-brand">
          <PiggyBank className="mt-0.5 size-4 shrink-0" />
          <span>
            Shipping these together saves you <span className="font-bold">{money(saving, dest)}</span> compared with ordering them one at a time.
          </span>
        </p>
      )}
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 text-muted-foreground" />
        Arrives <span className="font-semibold">{formatWindow(w)}</span>
      </p>
      <Button asChild size="lg" className="w-full">
        <Link href="/checkout">
          Checkout <ArrowRight />
        </Link>
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Lock className="size-3" /> This is exactly what checkout will charge, in {dest.currency}.
      </p>
    </aside>
  );
}
