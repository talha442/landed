"use client";

import Link from "next/link";
import { InfoIcon, TrashIcon, TruckIcon } from "@/components/icons";
import { bundlingSaving, estimate, formatWindow, money, orderDeliveryWindow } from "@/lib/shipping";
import { MAX_QTY, useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useResolvedLines, type ResolvedLine } from "@/lib/useCartLines";
import { useDestination } from "@/lib/useDestination";
import { ProductCard } from "@/components/ProductCard";

export function CartView({ catalog }: { catalog: ProductSummary[] }) {
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const saved = useStore((s) => s.saved);
  const recent = useStore((s) => s.recentlyViewed);
  const lines = useResolvedLines(cart, catalog);
  const savedLines = useResolvedLines(saved, catalog);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1150px] px-3 py-4">
        <div className="card h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1150px] px-3 py-4">
      {lines.length === 0 ? (
        <EmptyCart recent={recent.map((id) => catalog.find((p) => p.id === id)).filter((p): p is ProductSummary => !!p).slice(0, 4)} />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="card p-4 sm:p-6" aria-labelledby="cart-h">
            <h1 id="cart-h" className="text-2xl font-medium">
              Shopping cart
            </h1>
            <ul className="mt-2 divide-y divide-line">
              {lines.map((l) => (
                <CartItem key={l.key} line={l} />
              ))}
            </ul>
          </section>
          <Summary lines={lines} />
        </div>
      )}

      {savedLines.length > 0 && (
        <section className="card mt-4 p-4 sm:p-6" aria-labelledby="saved-h">
          <h2 id="saved-h" className="text-xl font-medium">
            Saved for later ({savedLines.length})
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {savedLines.map((l) => (
              <SavedItem key={l.key} line={l} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CartItem({ line }: { line: ResolvedLine }) {
  const dest = useDestination();
  const { setQty, remove, saveForLater } = useStore.getState();
  const p = line.product;
  return (
    <li className="flex gap-4 py-4">
      <Link href={`/p/${p.id}`} className="shrink-0 rounded bg-[#f7f8f8] p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.thumbnail} alt="" className="size-24 object-contain mix-blend-multiply sm:size-32" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-4">
          <Link href={`/p/${p.id}`} className="line-clamp-2 text-[17px] leading-snug hover:text-link-hover">
            {p.title}
          </Link>
          <p className="shrink-0 text-right font-bold">{money(p.price * line.qty, dest)}</p>
        </div>
        <p className={`mt-1 text-xs ${p.stock <= 5 ? "text-deal" : "text-ok"}`}>{p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</p>
        {line.size && (
          <p className="mt-1 text-sm">
            <span className="font-bold">Size:</span> {line.size}
          </p>
        )}
        {line.qty > 1 && <p className="mt-1 text-xs text-muted">{money(p.price, dest)} each</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center rounded-full border-2 border-cta" role="group" aria-label="Quantity">
            <button
              onClick={() => setQty(line.key, line.qty - 1)}
              className="flex size-8 items-center justify-center rounded-l-full hover:bg-[#fff8d6]"
              aria-label={line.qty === 1 ? "Remove item" : "Decrease quantity"}
            >
              {line.qty === 1 ? <TrashIcon /> : "−"}
            </button>
            <span className="w-8 text-center font-bold" aria-live="polite">
              {line.qty}
            </span>
            <button
              onClick={() => setQty(line.key, line.qty + 1)}
              disabled={line.qty >= Math.min(MAX_QTY, p.stock)}
              className="flex size-8 items-center justify-center rounded-r-full hover:bg-[#fff8d6] disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button className="link" onClick={() => remove(line.key)}>
            Delete
          </button>
          <button className="link" onClick={() => saveForLater(line.key)}>
            Save for later
          </button>
        </div>
      </div>
    </li>
  );
}

function Summary({ lines }: { lines: ResolvedLine[] }) {
  const dest = useDestination();
  const cost = lines.map((l) => ({ price: l.product.price, qty: l.qty }));
  const e = estimate(cost, dest);
  const saving = bundlingSaving(cost, dest);
  const w = orderDeliveryWindow(
    lines.map((l) => l.product.shippingInformation),
    dest,
  );
  const toFree = dest.freeShippingOver !== null && !e.freeShipping ? dest.freeShippingOver - e.items : 0;

  return (
    <aside className="card space-y-3 p-4 lg:sticky lg:top-28" aria-label="Order summary">
      {toFree > 0 && (
        <div className="rounded-md bg-[#f0faf8] p-3 text-sm">
          Add <span className="font-bold">{money(toFree, dest)}</span> more for free shipping.
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#d5e9e4]">
            <div className="h-full bg-ok" style={{ width: `${Math.min(100, (e.items / dest.freeShippingOver!) * 100)}%` }} />
          </div>
        </div>
      )}
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt>
            Items ({e.itemCount})
          </dt>
          <dd>{money(e.items, dest)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping to {dest.name}</dt>
          <dd>{e.shipping ? money(e.shipping, dest) : "Free"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{dest.dutyLabel} (est.)</dt>
          <dd>{money(e.duties, dest)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-lg font-bold">
          <dt>Total</dt>
          <dd>{money(e.total, dest)}</dd>
        </div>
      </dl>
      {saving > 0.005 && (
        <p className="flex gap-1.5 rounded-md bg-[#fff8e7] p-2.5 text-xs">
          <InfoIcon className="mt-px size-3.5 shrink-0" />
          <span>
            Shipping these together in one box saves you <span className="font-bold">{money(saving, dest)}</span> compared with ordering them one at a time.
          </span>
        </p>
      )}
      <p className="flex items-start gap-1.5 text-sm">
        <TruckIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          Arrives <span className="font-bold">{formatWindow(w)}</span>
        </span>
      </p>
      <Link href="/checkout" className="btn-cta w-full">
        Proceed to checkout
      </Link>
      <p className="text-center text-xs text-muted">This total is what checkout will charge, in {dest.currency}.</p>
    </aside>
  );
}

function SavedItem({ line }: { line: ResolvedLine }) {
  const dest = useDestination();
  const { moveToCart, removeSaved } = useStore.getState();
  const p = line.product;
  return (
    <li className="flex flex-col rounded-lg border border-line p-3">
      <Link href={`/p/${p.id}`} className="rounded bg-[#f7f8f8] p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.thumbnail} alt="" className="mx-auto aspect-square w-full object-contain mix-blend-multiply" />
      </Link>
      <Link href={`/p/${p.id}`} className="mt-2 line-clamp-2 text-sm hover:text-link-hover">
        {p.title}
      </Link>
      {line.size && <p className="text-xs text-muted">Size {line.size}</p>}
      <p className="mt-1 font-bold">{money(p.price, dest)}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <button className="btn-ghost px-3 py-1" onClick={() => moveToCart(line.key)}>
          Move to cart
        </button>
        <button className="link text-sm" onClick={() => removeSaved(line.key)}>
          Delete
        </button>
      </div>
    </li>
  );
}

function EmptyCart({ recent }: { recent: ProductSummary[] }) {
  return (
    <div className="space-y-4">
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Everything you add shows its full delivered price, so the total here is the total you pay.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/s?sort=discount" className="btn-cta">
            See today&apos;s deals
          </Link>
          <Link href="/s" className="btn-ghost">
            Browse everything
          </Link>
        </div>
      </div>
      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
