"use client";

import { useMemo } from "react";
import type { CartLine } from "./store";
import type { ProductSummary } from "./types";

export type ResolvedLine = CartLine & { product: ProductSummary };

/** Joins persisted cart lines to catalog entries, dropping any that no longer exist. */
export function useResolvedLines(lines: CartLine[], catalog: ProductSummary[]) {
  return useMemo(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    return lines.flatMap((l) => {
      const product = byId.get(l.productId);
      return product ? [{ ...l, product }] : [];
    });
  }, [lines, catalog]);
}
