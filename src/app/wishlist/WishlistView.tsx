"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { CardPrice } from "@/components/product/PriceDisplay";
import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { ProductRail } from "@/components/product/ProductRail";
import { ProductRating } from "@/components/product/ProductRating";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";

export function WishlistView({ catalog, suggestions }: { catalog: ProductSummary[]; suggestions: ProductSummary[] }) {
  const hydrated = useHydrated();
  const ids = useStore((s) => s.wishlist);
  const user = useCurrentUser();
  const { toggleWishlist, addToCart } = useStore.getState();
  const router = useRouter();
  const items = ids.map((id) => catalog.find((p) => p.id === id)).filter((p): p is ProductSummary => !!p);

  if (!hydrated) {
    return (
      <div className="container-page py-8">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  function moveToCart(p: ProductSummary) {
    if (p.sizeKind) return router.push(`/product/${p.id}`); // needs a size first
    addToCart(p.id);
    toggleWishlist(p.id);
    toast.success("Moved to your cart", { description: p.name, action: { label: "View cart", onClick: () => router.push("/cart") } });
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-extrabold">Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} saved {items.length === 1 ? "item" : "items"}
        {!user && items.length > 0 && " on this device"}
      </p>

      {items.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Heart}
          title="Nothing saved yet"
          body="Tap the heart on any product to keep it here. Prices update to your delivery country, so you'll always see what it'd cost today."
          action={
            <Button asChild>
              <Link href="/search">Find something you like</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="flex gap-4 rounded-3xl border bg-card p-4">
              <Link href={`/product/${p.id}`} tabIndex={-1} aria-hidden className="shrink-0 overflow-hidden rounded-2xl bg-[#f3f2ee]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt="" className="size-28 object-contain p-2 mix-blend-multiply" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Link href={`/product/${p.id}`} className="line-clamp-2 text-sm font-semibold hover:underline">
                  {p.name}
                </Link>
                <ProductRating rating={p.rating} />
                <CardPrice price={p.price} originalPrice={p.originalPrice} discount={p.discount} />
                <div className="mt-auto flex items-center gap-1.5 pt-1">
                  <Button size="sm" onClick={() => moveToCart(p)} disabled={p.stock === 0}>
                    <ShoppingBag /> {p.stock === 0 ? "Out of stock" : p.sizeKind ? "Choose size" : "Move to cart"}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove ${p.name} from wishlist`}
                    onClick={() => {
                      toggleWishlist(p.id);
                      toast("Removed from your wishlist", { description: p.name, action: { label: "Undo", onClick: () => toggleWishlist(p.id) } });
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-16">
        <ProductRail title="Trending now" subtitle="Top rated and in stock" href="/search?sort=rating" products={suggestions} />
      </div>
    </div>
  );
}
