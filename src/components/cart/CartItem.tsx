"use client";

import { Bookmark, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { money } from "@/lib/shipping";
import { MAX_QTY, useStore } from "@/lib/store";
import type { ResolvedLine } from "@/lib/useCartLines";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";

export function CartItem({ line, index }: { line: ResolvedLine; index: number }) {
  const dest = useDestination();
  const { setQty, remove, restore, saveForLater, moveToCart } = useStore.getState();
  const p = line.product;
  const max = Math.min(MAX_QTY, p.stock);

  function removeLine() {
    const removed = remove(line.key);
    if (removed) toast("Removed from your cart", { description: p.name, action: { label: "Undo", onClick: () => restore(removed, index) } });
  }

  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0 sm:gap-5">
      <Link href={`/product/${p.id}`} className="shrink-0 overflow-hidden rounded-2xl bg-[#f3f2ee]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.thumbnail} alt={p.name} className="size-24 object-contain p-2 mix-blend-multiply sm:size-28" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{p.brand ?? p.subcategory}</p>
            <Link href={`/product/${p.id}`} className="line-clamp-2 font-semibold hover:underline">
              {p.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {line.size && <>Size {line.size} · </>}
              <span className={cn(p.stock <= 5 && "font-medium text-warning")}>{p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-bold tabular">{money(p.price * line.qty, dest)}</p>
            {line.qty > 1 && <p className="text-xs text-muted-foreground tabular">{money(p.price, dest)} each</p>}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
          <div className="flex h-9 items-center rounded-full border bg-background" role="group" aria-label={`Quantity of ${p.name}`}>
            <button
              onClick={() => (line.qty === 1 ? removeLine() : setQty(line.key, line.qty - 1))}
              className="flex size-9 items-center justify-center rounded-l-full hover:bg-muted"
              aria-label={line.qty === 1 ? "Remove item" : "Decrease quantity"}
            >
              {line.qty === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
            </button>
            <span key={line.qty} className="w-7 animate-in text-center text-sm font-semibold tabular zoom-in-75" aria-live="polite">
              {line.qty}
            </span>
            <button
              onClick={() => setQty(line.key, line.qty + 1)}
              disabled={line.qty >= max}
              className="flex size-9 items-center justify-center rounded-r-full hover:bg-muted disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              saveForLater(line.key);
              toast("Saved for later", { description: p.name, action: { label: "Undo", onClick: () => moveToCart(line.key) } });
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Bookmark className="size-3.5" /> Save for later
          </button>
          <button onClick={removeLine} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
