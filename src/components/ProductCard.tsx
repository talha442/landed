"use client";

import Link from "next/link";
import { useState } from "react";
import { categoryName, sizeKind } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { CheckIcon } from "./icons";
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
        <p className="text-xs text-muted">{p.brand ?? categoryName(p.category)}</p>
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
            <p className="text-sm text-muted">Currently unavailable</p>
          ) : needsSize ? (
            <Link href={`/p/${p.id}`} className="btn-ghost w-full">
              Choose size
            </Link>
          ) : (
            <AddButton id={p.id} />
          )}
        </div>
      </div>
    </article>
  );
}

function AddButton({ id }: { id: number }) {
  const add = useStore((s) => s.addToCart);
  const [added, setAdded] = useState(false);
  return (
    <button
      className="btn-cta w-full"
      onClick={() => {
        add(id);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? (
        <>
          <CheckIcon /> Added
        </>
      ) : (
        "Add to cart"
      )}
    </button>
  );
}
