"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type Filters = {
  categories: string[];
  subcategories: string[];
  brands: string[];
  rating: number;
  within: number;
  min: number | null;
  max: number | null;
  sort: string;
  page: number;
};

export const FILTER_KEYS = ["category", "sub", "brand", "rating", "by", "min", "max", "page"] as const;

/**
 * Filters live in the URL (shareable, back-button friendly) but are written with the
 * History API, which Next.js syncs into useSearchParams without a server round trip.
 * So a filter change re-renders instantly instead of re-fetching the page.
 */
export function useFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const num = (k: string) => {
    const v = params.get(k);
    return v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : null;
  };

  const filters: Filters = {
    categories: params.getAll("category"),
    subcategories: params.getAll("sub"),
    brands: params.getAll("brand"),
    rating: num("rating") ?? 0,
    within: num("by") ?? 0,
    min: num("min"),
    max: num("max"),
    sort: params.get("sort") ?? "",
    page: Math.max(1, num("page") ?? 1),
  };

  const update = useCallback(
    (mut: (sp: URLSearchParams) => void, { resetPage = true, push = false } = {}) => {
      const sp = new URLSearchParams(window.location.search);
      mut(sp);
      if (resetPage) sp.delete("page");
      const url = `${pathname}${sp.size ? `?${sp}` : ""}`;
      window.history[push ? "pushState" : "replaceState"](null, "", url);
    },
    [pathname],
  );

  const setList = (key: "category" | "sub" | "brand", values: string[]) =>
    update((sp) => {
      sp.delete(key);
      values.forEach((v) => sp.append(key, v));
    });

  const setValue = (key: string, value: string | number | null, opts?: { resetPage?: boolean; push?: boolean }) =>
    update((sp) => (value === null || value === "" || value === 0 ? sp.delete(key) : sp.set(key, String(value))), opts);

  const clearAll = () => update((sp) => FILTER_KEYS.forEach((k) => sp.delete(k)));

  const activeCount = filters.categories.length + filters.subcategories.length + filters.brands.length + (filters.rating ? 1 : 0) + (filters.within ? 1 : 0) + (filters.min !== null || filters.max !== null ? 1 : 0);

  return { filters, update, setList, setValue, clearAll, activeCount };
}
