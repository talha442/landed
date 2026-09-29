"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckIcon, InfoIcon, TruckIcon } from "@/components/icons";
import { Amount, PriceSkeleton } from "@/components/Price";
import { deliveryWindow, estimate, estimateOne, formatWindow, money } from "@/lib/shipping";
import { MAX_QTY, useHydrated, useStore } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";
import { SizePicker } from "./SizePicker";

type Props = {
  product: {
    id: number;
    title: string;
    price: number;
    discountPercentage: number;
    stock: number;
    shippingInformation: string;
    returnPolicy: string;
    warranty: string;
    brand: string | null;
    sizeKind: "apparel" | "shoes" | null;
  };
};

export function Purchase({ product: p }: Props) {
  const dest = useDestination();
  const hydrated = useHydrated();
  const add = useStore((s) => s.addToCart);
  const router = useRouter();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const e = estimateOne(p.price, dest);
  const w = deliveryWindow(p.shippingInformation, dest);
  const extraItemShipping = dest.perItem;
  const inStock = p.stock > 0;

  function commit() {
    if (p.sizeKind && !size) {
      setSizeError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    add(p.id, qty, size ?? undefined);
    return true;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        {/* Price: the delivered total leads, and the split is always visible, never behind "Details". */}
        <section aria-label="Price">
          {!hydrated ? (
            <PriceSkeleton />
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                {p.discountPercentage >= 10 && <span className="text-2xl font-light text-deal">-{Math.round(p.discountPercentage)}%</span>}
                <Amount usd={e.total} className="text-[34px]" />
              </div>
              <p className="mt-1 text-sm text-muted">Total delivered to {dest.name}. No extra charges at checkout.</p>
              <dl className="mt-3 max-w-sm space-y-1 rounded-lg border border-line p-3 text-sm">
                <Row label="Item price" value={money(e.items, dest)} />
                <Row label={e.freeShipping ? "Shipping (free over " + money(dest.freeShippingOver!, dest) + ")" : "Shipping"} value={e.shipping ? money(e.shipping, dest) : "Free"} />
                <Row label={`${dest.dutyLabel} (est.)`} value={money(e.duties, dest)} />
                <div className="flex justify-between border-t border-line pt-1.5 font-bold">
                  <dt>You pay</dt>
                  <dd>{money(e.total, dest)}</dd>
                </div>
              </dl>
              {dest.freeShippingOver !== null && !e.freeShipping && (
                <p className="mt-2 flex max-w-sm gap-1.5 text-xs text-muted">
                  <InfoIcon className="mt-px size-3.5 shrink-0" />
                  <span>Free shipping on orders over {money(dest.freeShippingOver, dest)}. Your cart tracks how close you are.</span>
                </p>
              )}
              {extraItemShipping > 0 && e.shipping > 0 && (
                <p className="mt-2 flex max-w-sm gap-1.5 text-xs text-muted">
                  <InfoIcon className="mt-px size-3.5 shrink-0" />
                  <span>
                    Shipping is charged per box. Each extra item in the same order adds only {money(extraItemShipping, dest)} shipping, so ordering together is cheaper.
                  </span>
                </p>
              )}
            </>
          )}
        </section>

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
      </div>

      {/* Buy box */}
      <aside className="h-fit rounded-lg border border-line p-4" aria-label="Buy">
        {!hydrated ? (
          <PriceSkeleton />
        ) : (
          <>
            <Amount usd={estimate([{ price: p.price, qty }], dest).total} className="text-2xl" />
            {qty > 1 && <p className="text-xs text-muted">for {qty}, shipped together in one box</p>}
            <p className="mt-2 flex items-start gap-1.5 text-sm">
              <TruckIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                Delivered <span className="font-bold">{formatWindow(w)}</span>
              </span>
            </p>
          </>
        )}
        <p className={`mt-3 text-lg ${inStock ? (p.stock <= 5 ? "text-deal" : "text-ok") : "text-muted"}`}>
          {inStock ? (p.stock <= 5 ? `Only ${p.stock} left in stock` : "In stock") : "Currently unavailable"}
        </p>
        {inStock && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              Quantity
              <select
                value={qty}
                onChange={(ev) => setQty(Number(ev.target.value))}
                className="rounded-md border border-line bg-[#f0f2f2] px-2 py-1 shadow-sm"
              >
                {Array.from({ length: Math.min(MAX_QTY, p.stock) }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <button
              className="btn-cta w-full"
              onClick={() => {
                if (!commit()) return;
                setAdded(true);
              }}
            >
              Add to cart
            </button>
            <button
              className="btn-buy w-full"
              onClick={() => {
                if (commit()) router.push("/checkout");
              }}
            >
              Buy now
            </button>
            {added && (
              <div className="rounded-md bg-[#f0faf8] p-2 text-sm" role="status">
                <p className="flex items-center gap-1 font-bold text-ok">
                  <CheckIcon /> Added to cart
                </p>
                <Link href="/cart" className="link text-xs">
                  Go to cart
                </Link>
              </div>
            )}
          </div>
        )}
        <dl className="mt-4 space-y-1 text-xs">
          <div className="flex gap-2">
            <dt className="w-16 text-muted">Sold by</dt>
            <dd>{p.brand ?? "Marketplace seller"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 text-muted">Returns</dt>
            <dd>{p.returnPolicy}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 text-muted">Warranty</dt>
            <dd>{p.warranty}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
