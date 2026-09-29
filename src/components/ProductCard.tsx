"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { categoryName, sizeKind } from "@/lib/catalog";
import { MAX_COMPARE, useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { DeliveredPrice } from "./Price";
import { Stars } from "./Stars";

export function ProductCard({ p, priority = false }: { p: ProductSummary; priority?: boolean }) {
  const needsSize = sizeKind(p.category) !== null;
  return (
    <article className="card group flex flex-col overflow-hidden border border-transparent hover:border-line">
      <Link href={`/p/${p.id}`} className="block bg-[#f7f8f8] p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized local webp, no optimizer needed */}
        <img
          src={p.thumbnail}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className="mx-auto aspect-square w-full object-contain mix-blend-multiply transition-transform group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-xs text-subtle">{p.brand ?? categoryName(p.category)}</p>
        <Link href={`/p/${p.id}`} className="line-clamp-2 text-[15px] leading-snug font-medium hover:text-link-hover">
          {p.title}
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <span>{p.rating.toFixed(1)}</span>
          <Stars rating={p.rating} className="size-3.5" />
          <span className="text-link">({p.reviewCount})</span>
        </div>
        <DeliveredPrice price={p.price} discount={p.discountPercentage} shippingInformation={p.shippingInformation} />
        {p.stock > 0 && p.stock <= 5 && <p className="text-xs text-deal">Only {p.stock} left</p>}
        <div className="mt-auto pt-2">
          {p.stock === 0 ? (
            <p className="text-sm text-subtle">Currently unavailable</p>
          ) : needsSize ? (
            <Link href={`/p/${p.id}`} className="btn-ghost w-full">
              Choose size
            </Link>
          ) : (
            <AddButton p={p} />
          )}
          <CompareToggle p={p} />
        </div>
      </div>
    </article>
  );
}

function AddButton({ p }: { p: ProductSummary }) {
  const add = useStore((s) => s.addToCart);
  const router = useRouter();
  return (
    <button
      className="btn-cta w-full"
      onClick={() => {
        add(p.id);
        toast.success("Added to cart", { description: p.title, action: { label: "View cart", onClick: () => router.push("/cart") } });
      }}
    >
      Add to cart
    </button>
  );
}

function CompareToggle({ p }: { p: ProductSummary }) {
  const hydrated = useHydrated();
  const checked = useStore((s) => s.compare.some((x) => x.id === p.id));
  const toggle = useStore((s) => s.toggleCompare);
  return (
    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-subtle select-none">
      <input
        type="checkbox"
        className="accent-link"
        checked={hydrated && checked}
        onChange={() => {
          if (!toggle(p)) toast(`You can compare up to ${MAX_COMPARE} items`, { description: "Remove one from the tray at the bottom first." });
        }}
      />
      Compare
    </label>
  );
}
