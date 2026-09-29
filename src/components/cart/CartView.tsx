"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductRail } from "@/components/product/ProductRail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useResolvedLines, type ResolvedLine } from "@/lib/useCartLines";
import { useDestination } from "@/lib/useDestination";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

export function CartView({ catalog, suggestions }: { catalog: ProductSummary[]; suggestions: ProductSummary[] }) {
  const hydrated = useHydrated();
  const cart = useStore((s) => s.cart);
  const saved = useStore((s) => s.saved);
  const recent = useStore((s) => s.recentlyViewed);
  const lines = useResolvedLines(cart, catalog);
  const savedLines = useResolvedLines(saved, catalog);

  if (!hydrated) return <CartSkeleton />;

  const count = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className="container-page py-8">
      {lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          body="Anything you add shows its delivered price, so the total here is the total you'll pay. Nothing extra at checkout."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/search">Start shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/wishlist">View wishlist</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <h1 className="text-3xl font-extrabold">Your cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} {count === 1 ? "item" : "items"}, shipped together in one box
          </p>
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
            <section className="rounded-3xl border bg-card p-5 sm:p-6" aria-label="Items in your cart">
              <ul className="divide-y">
                {lines.map((l, i) => (
                  <CartItem key={l.key} line={l} index={i} />
                ))}
              </ul>
            </section>
            <CartSummary lines={lines} />
          </div>
        </>
      )}

      {savedLines.length > 0 && (
        <section className="mt-10" aria-labelledby="saved-h">
          <h2 id="saved-h" className="text-xl font-bold">
            Saved for later <span className="font-medium text-muted-foreground">({savedLines.length})</span>
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {savedLines.map((l) => (
              <SavedItem key={l.key} line={l} />
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16">
        <ProductRail
          title={lines.length ? "Add to the same box" : "Popular right now"}
          subtitle={lines.length ? "Each extra item adds only a small per-item shipping fee" : undefined}
          products={(recent.length ? recent.filter((p) => !cart.some((l) => l.productId === p.id)) : suggestions).slice(0, 4)}
        />
      </div>
    </div>
  );
}

function SavedItem({ line }: { line: ResolvedLine }) {
  const dest = useDestination();
  const { moveToCart, removeSaved } = useStore.getState();
  const p = line.product;
  return (
    <li className="flex flex-col rounded-2xl border bg-card p-3">
      <Link href={`/product/${p.id}`} className="overflow-hidden rounded-xl bg-[#f3f2ee]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.thumbnail} alt="" className="aspect-square w-full object-contain p-3 mix-blend-multiply" />
      </Link>
      <Link href={`/product/${p.id}`} className="mt-2.5 line-clamp-2 text-sm font-semibold hover:underline">
        {p.name}
      </Link>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {money(p.price, dest)} item{line.size && ` · Size ${line.size}`}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => {
            moveToCart(line.key);
            toast.success("Moved to your cart", { description: p.name });
          }}
        >
          Move to cart
        </Button>
        <Button size="sm" variant="ghost" onClick={() => removeSaved(line.key)} aria-label={`Remove ${p.name} from saved items`}>
          Remove
        </Button>
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-label="Loading cart">
      <Skeleton className="h-9 w-48" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5 rounded-3xl border bg-card p-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-28 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="mt-6 h-9 w-40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}
