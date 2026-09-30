"use client";

import { SearchX, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { departments, getDepartment } from "@/lib/catalog-meta";
import { tokens } from "@/lib/search";
import { deliveryWindow, estimateOne } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { FilterPanel, type Facets } from "./FilterPanel";
import { useFilters } from "./useFilters";

const PAGE_SIZE = 24;

const SORTS = [
  { value: "relevance", label: "Most relevant" },
  { value: "total", label: "Delivered price: low to high" },
  { value: "total-desc", label: "Delivered price: high to low" },
  { value: "rating", label: "Best rated" },
  { value: "fastest", label: "Fastest delivery" },
  { value: "discount", label: "Biggest discount" },
];

export function SearchView({ q, results }: { q: string; results: ProductSummary[] }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  const { filters, setList, setValue, update, clearAll, activeCount } = useFilters();
  const searched = useStore((s) => s.searched);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Searches that arrive by URL (shared links, back button) still count as recent.
  useEffect(() => {
    if (q.trim()) searched(q);
  }, [q, searched]);

  const enriched = useMemo(
    () => results.map((p) => ({ p, total: estimateOne(p.price, dest).total * dest.rate, days: deliveryWindow(p.deliveryInfo, dest).maxDays })),
    [results, dest],
  );

  const inDepartments = useMemo(
    () => (filters.categories.length ? enriched.filter((x) => filters.categories.includes(x.p.category)) : enriched),
    [enriched, filters.categories],
  );
  const inCategories = useMemo(
    () => (filters.subcategories.length ? inDepartments.filter((x) => filters.subcategories.includes(x.p.subcategory)) : inDepartments),
    [inDepartments, filters.subcategories],
  );

  const facets: Facets = useMemo(() => {
    const catCounts = new Map<string, number>();
    for (const { p } of enriched) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
    const subCounts = new Map<string, number>();
    for (const { p } of inDepartments) subCounts.set(p.subcategory, (subCounts.get(p.subcategory) ?? 0) + 1);
    const brandCounts = new Map<string, number>();
    for (const { p } of inCategories) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
    const totals = inCategories.map((x) => x.total);
    return {
      categories: departments.filter((d) => catCounts.has(d.slug)).map((d) => ({ slug: d.slug, name: d.name, count: catCounts.get(d.slug)! })),
      subcategories: [...subCounts.entries()].map(([name, count]) => ({ name, count })),
      brands: [...brandCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })),
      priceRange: totals.length ? [Math.floor(Math.min(...totals)), Math.ceil(Math.max(...totals))] : [0, 0],
    };
  }, [enriched, inDepartments, inCategories]);

  const shown = useMemo(() => {
    const list = inCategories.filter(
      (x) =>
        x.p.rating >= filters.rating &&
        (!filters.within || x.days <= filters.within) &&
        (filters.brands.length === 0 || (x.p.brand && filters.brands.includes(x.p.brand))) &&
        // Price bounds are in the destination's currency, which only the browser knows.
        (!hydrated || filters.min === null || x.total >= filters.min) &&
        (!hydrated || filters.max === null || x.total <= filters.max),
    );
    const by: Record<string, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      total: (a, b) => a.total - b.total,
      "total-desc": (a, b) => b.total - a.total,
      rating: (a, b) => b.p.rating - a.p.rating,
      fastest: (a, b) => a.days - b.days || a.total - b.total,
      discount: (a, b) => (b.p.discount ?? 0) - (a.p.discount ?? 0),
    };
    return by[filters.sort] ? [...list].sort(by[filters.sort]) : list;
  }, [inCategories, filters, hydrated]);

  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const pageItems = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((x) => x.p);

  const setPrice = (min: number | null, max: number | null) =>
    update((sp) => {
      if (min === null) sp.delete("min");
      else sp.set("min", String(Math.round(min)));
      if (max === null) sp.delete("max");
      else sp.set("max", String(Math.round(max)));
    });

  const singleDept = filters.categories.length === 1 ? getDepartment(filters.categories[0]) : undefined;
  const singleSub = filters.subcategories.length === 1 ? filters.subcategories[0] : undefined;
  const title = q ? `“${q}”` : singleSub ? singleSub : singleDept ? singleDept.name : filters.sort === "discount" ? "Deals" : "All products";
  const invalid = q.trim().length > 0 && tokens(q).length === 0;

  const panel = <FilterPanel facets={facets} filters={filters} dest={dest} setList={setList} setValue={setValue} setPrice={setPrice} />;

  const sortSelect = (
    <Select value={filters.sort || "relevance"} onValueChange={(v) => setValue("sort", v === "relevance" ? null : v, { resetPage: true })}>
      <SelectTrigger className="h-10 min-w-0 flex-1 rounded-full bg-card px-4 sm:w-[240px] sm:flex-none" aria-label="Sort results">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORTS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="container-page py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {shown.length} {shown.length === 1 ? "result" : "results"} · Prices delivered to {hydrated ? dest.name : "…"} · No sponsored listings
          </p>
        </div>
        <div className="hidden sm:block">{sortSelect}</div>
      </div>

      {/* Mobile: filter and sort side by side, always in reach. */}
      <div className="sticky top-[108px] z-20 -mx-4 mt-4 flex gap-2 border-b bg-background/90 px-4 py-2.5 backdrop-blur sm:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 bg-card">
              <SlidersHorizontal /> Filters
              {activeCount > 0 && <Badge className="ml-0.5 h-5 min-w-5 rounded-full px-1.5">{activeCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] gap-0 rounded-t-3xl p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="font-heading text-lg">Filters</SheetTitle>
              <SheetDescription>Results update as you choose.</SheetDescription>
            </SheetHeader>
            <div className="overflow-y-auto px-5">{panel}</div>
            <SheetFooter className="flex-row gap-2 border-t px-5 py-4">
              <Button variant="outline" className="flex-1" onClick={clearAll} disabled={activeCount === 0}>
                Clear all
              </Button>
              <Button className="flex-[2]" onClick={() => setSheetOpen(false)}>
                Show {shown.length} {shown.length === 1 ? "result" : "results"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        {sortSelect}
      </div>

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-60 shrink-0 md:block" aria-label="Filters">
          <div className="sticky top-32">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-heading font-bold">Filters</h2>
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Clear all
                </button>
              )}
            </div>
            {panel}
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-labelledby="results-h">
          <h2 id="results-h" className="sr-only">
            Results
          </h2>
          {activeCount > 0 && <ActiveFilters filters={filters} currency={dest.currency} setList={setList} setValue={setValue} setPrice={setPrice} clearAll={clearAll} />}

          {!hydrated && (filters.min !== null || filters.max !== null) ? (
            <ProductGridSkeleton count={8} />
          ) : invalid ? (
            <Empty title="That search didn't have any words in it" body="Try a product, brand or category, like “watch”, “Apple” or “kitchen”." />
          ) : results.length === 0 ? (
            <Empty
              title={`Nothing matches “${q}”`}
              body="Check the spelling, or try something broader. Here are some places to start:"
              links={[
                { href: "/search?category=electronics", label: "Electronics" },
                { href: "/search?category=fashion", label: "Fashion" },
                { href: "/search?sort=discount", label: "Deals" },
              ]}
            />
          ) : shown.length === 0 ? (
            <Empty title="No products match these filters" body={`${results.length} products match your search, but not with these filters.`} action={<Button onClick={clearAll}>Clear filters</Button>} />
          ) : (
            <>
              <ProductGrid products={pageItems} />
              {pages > 1 && (
                <ResultsPagination
                  page={page}
                  pages={pages}
                  onPage={(n) => {
                    setValue("page", n === 1 ? null : n, { resetPage: false, push: true });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ActiveFilters({
  filters,
  currency,
  setList,
  setValue,
  setPrice,
  clearAll,
}: {
  filters: ReturnType<typeof useFilters>["filters"];
  currency: string;
  setList: (key: "category" | "sub" | "brand", values: string[]) => void;
  setValue: (key: string, value: string | number | null) => void;
  setPrice: (min: number | null, max: number | null) => void;
  clearAll: () => void;
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
  const chips: { label: string; clear: () => void }[] = [
    ...filters.categories.map((c) => ({ label: getDepartment(c)?.name ?? c, clear: () => setList("category", filters.categories.filter((x) => x !== c)) })),
    ...filters.subcategories.map((s) => ({ label: s, clear: () => setList("sub", filters.subcategories.filter((x) => x !== s)) })),
    ...filters.brands.map((b) => ({ label: b, clear: () => setList("brand", filters.brands.filter((x) => x !== b)) })),
    ...(filters.rating ? [{ label: `${filters.rating}★ & up`, clear: () => setValue("rating", null) }] : []),
    ...(filters.within ? [{ label: `Arrives within ${filters.within} days`, clear: () => setValue("by", null) }] : []),
    ...(filters.min !== null || filters.max !== null
      ? [{ label: `${currency} ${filters.min !== null ? fmt(filters.min) : "0"} – ${filters.max !== null ? fmt(filters.max) : "any"}`, clear: () => setPrice(null, null) }]
      : []),
  ];
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Badge key={c.label} variant="outline" className="h-8 gap-1 rounded-full bg-card pr-1 pl-3 text-[13px] font-medium">
          {c.label}
          <button onClick={c.clear} className="flex size-6 items-center justify-center rounded-full hover:bg-muted" aria-label={`Remove filter: ${c.label}`}>
            <X className="size-3.5" />
          </button>
        </Badge>
      ))}
      <button onClick={clearAll} className="px-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        Clear all
      </button>
    </div>
  );
}

function ResultsPagination({ page, pages, onPage }: { page: number; pages: number; onPage: (n: number) => void }) {
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const click = (n: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (n >= 1 && n <= pages && n !== page) onPage(n);
  };
  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={click(page - 1)} aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-40" : ""} />
        </PaginationItem>
        {nums.map((n, i) => (
          <PaginationItem key={n}>
            {i > 0 && n - nums[i - 1] > 1 && <PaginationEllipsis />}
            <PaginationLink href="#" isActive={n === page} onClick={click(n)}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={click(page + 1)} aria-disabled={page === pages} className={page === pages ? "pointer-events-none opacity-40" : ""} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function Empty({ title, body, links, action }: { title: string; body: string; links?: { href: string; label: string }[]; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-6 text-muted-foreground" />
      </span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {links && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {links.map((l) => (
            <Button key={l.href} asChild variant="outline" size="sm">
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
