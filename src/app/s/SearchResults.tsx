"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { departments } from "@/lib/catalog";
import { deliveryWindow, estimateOne } from "@/lib/shipping";
import { useHydrated } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { XIcon } from "@/components/icons";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SORTS = [
  { value: "", label: "Most relevant" },
  { value: "total", label: "Lowest total cost" },
  { value: "total-desc", label: "Highest total cost" },
  { value: "rating", label: "Best rated" },
  { value: "fastest", label: "Fastest delivery" },
  { value: "discount", label: "Biggest discount" },
] as const;

const DELIVERY = [
  { value: "7", label: "Within 7 days" },
  { value: "14", label: "Within 14 days" },
  { value: "30", label: "Within 30 days" },
];

export function SearchResults({
  q,
  dept,
  results,
  deptCounts,
}: {
  q: string;
  dept: string;
  results: ProductSummary[];
  deptCounts: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const dest = useDestination();
  const hydrated = useHydrated();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sort = params.get("sort") ?? "";
  const minRating = Number(params.get("rating") ?? 0);
  const within = Number(params.get("by") ?? 0);
  const brands = params.getAll("brand");
  // Price bounds are typed in local currency and stored that way in the URL.
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";

  function update(mut: (sp: URLSearchParams) => void) {
    const sp = new URLSearchParams(params.toString());
    mut(sp);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  }

  const enriched = useMemo(
    () =>
      results.map((p) => ({
        p,
        total: estimateOne(p.price, dest).total * dest.rate,
        days: deliveryWindow(p.shippingInformation, dest).maxDays,
      })),
    [results, dest],
  );

  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of results) if (r.brand) counts.set(r.brand, (counts.get(r.brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
  }, [results]);

  const shown = useMemo(() => {
    let list = enriched.filter(
      (x) =>
        x.p.rating >= minRating &&
        (!within || x.days <= within) &&
        (brands.length === 0 || (x.p.brand && brands.includes(x.p.brand))) &&
        (!min || x.total >= Number(min)) &&
        (!max || x.total <= Number(max)),
    );
    const by: Record<string, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      total: (a, b) => a.total - b.total,
      "total-desc": (a, b) => b.total - a.total,
      rating: (a, b) => b.p.rating - a.p.rating,
      fastest: (a, b) => a.days - b.days || a.total - b.total,
      discount: (a, b) => b.p.discountPercentage - a.p.discountPercentage,
    };
    if (by[sort]) list = [...list].sort(by[sort]);
    return list;
  }, [enriched, minRating, within, brands, min, max, sort]);

  const activeCount = (minRating ? 1 : 0) + (within ? 1 : 0) + brands.length + (min || max ? 1 : 0);
  const deptName = departments.find((d) => d.slug === dept)?.name;

  const filters = (
    <div className="space-y-6 text-sm">
      <FilterGroup title="Department">
        <ul className="space-y-1">
          <li>
            <DeptLink q={q} slug="" active={!dept} label="All departments" />
          </li>
          {departments
            .filter((d) => deptCounts[d.slug] > 0)
            .map((d) => (
              <li key={d.slug}>
                <DeptLink q={q} slug={d.slug} active={dept === d.slug} label={d.name} count={deptCounts[d.slug]} />
              </li>
            ))}
        </ul>
      </FilterGroup>

      <FilterGroup title={`Total price (${dest.currency})`} hint="Item, shipping and import charges together">
        <PriceRange
          key={`${dest.code}|${min}|${max}`}
          min={min}
          max={max}
          onApply={(a, b) =>
            update((sp) => {
              if (a) sp.set("min", a);
              else sp.delete("min");
              if (b) sp.set("max", b);
              else sp.delete("max");
            })
          }
        />
      </FilterGroup>

      <FilterGroup title="Customer rating">
        {[4, 3].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 py-0.5">
            <input
              type="radio"
              name="rating"
              checked={minRating === r}
              onChange={() => update((sp) => sp.set("rating", String(r)))}
              className="accent-link"
            />
            {r}★ & up
          </label>
        ))}
        {minRating > 0 && (
          <button className="link mt-1 text-xs" onClick={() => update((sp) => sp.delete("rating"))}>
            Any rating
          </button>
        )}
      </FilterGroup>

      <FilterGroup title={`Delivered to ${dest.name}`}>
        {DELIVERY.map((d) => (
          <label key={d.value} className="flex cursor-pointer items-center gap-2 py-0.5">
            <input
              type="radio"
              name="by"
              checked={String(within) === d.value}
              onChange={() => update((sp) => sp.set("by", d.value))}
              className="accent-link"
            />
            {d.label}
          </label>
        ))}
        {within > 0 && (
          <button className="link mt-1 text-xs" onClick={() => update((sp) => sp.delete("by"))}>
            Any time
          </button>
        )}
      </FilterGroup>

      {brandOptions.length > 0 && (
        <FilterGroup title="Brand">
          {brandOptions.map(([b, n]) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={(e) =>
                  update((sp) => {
                    const next = e.target.checked ? [...brands, b] : brands.filter((x) => x !== b);
                    sp.delete("brand");
                    next.forEach((x) => sp.append("brand", x));
                  })
                }
                className="accent-link"
              />
              <span className="flex-1">{b}</span>
              <span className="text-xs text-subtle">{n}</span>
            </label>
          ))}
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4">
      <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm">
          {hydrated ? shown.length : results.length} {shown.length === 1 ? "result" : "results"}
          {q && (
            <>
              {" "}
              for <span className="font-bold text-[#c45500]">&ldquo;{q}&rdquo;</span>
            </>
          )}
          {deptName && <> in {deptName}</>}
          <span className="ml-2 text-xs text-subtle">· No sponsored results</span>
        </p>
        <div className="flex items-center gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <button className="btn-ghost py-1.5 lg:hidden">Filters{activeCount > 0 && ` (${activeCount})`}</button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm gap-0 overflow-y-auto">
              <SheetHeader className="border-b border-line">
                <SheetTitle className="text-lg">Filters</SheetTitle>
                <SheetDescription>
                  {shown.length} {shown.length === 1 ? "result" : "results"}. Changes apply as you pick.
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">{filters}</div>
              <SheetFooter className="sticky bottom-0 border-t border-line bg-white">
                <button className="btn-cta w-full" onClick={() => setFiltersOpen(false)}>
                  Show {shown.length} {shown.length === 1 ? "result" : "results"}
                </button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline">Sort by</span>
            <select
              value={sort}
              onChange={(e) => update((sp) => (e.target.value ? sp.set("sort", e.target.value) : sp.delete("sort")))}
              className="rounded-md border border-line bg-[#f0f2f2] px-2 py-1.5 text-sm shadow-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="card sticky top-28 p-4">{filters}</div>
        </aside>

        <section className="min-w-0 flex-1" aria-label="Results">
          {activeCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              {minRating > 0 && <Chip onClear={() => update((sp) => sp.delete("rating"))}>{`${minRating}★ & up`}</Chip>}
              {within > 0 && <Chip onClear={() => update((sp) => sp.delete("by"))}>{`Within ${within} days`}</Chip>}
              {(min || max) && (
                <Chip onClear={() => update((sp) => (sp.delete("min"), sp.delete("max")))}>
                  {`${dest.currency} ${min || "0"} – ${max || "any"}`}
                </Chip>
              )}
              {brands.map((b) => (
                <Chip
                  key={b}
                  onClear={() =>
                    update((sp) => {
                      sp.delete("brand");
                      brands.filter((x) => x !== b).forEach((x) => sp.append("brand", x));
                    })
                  }
                >
                  {b}
                </Chip>
              ))}
              <button
                className="link text-xs"
                onClick={() => update((sp) => ["rating", "by", "min", "max", "brand"].forEach((k) => sp.delete(k)))}
              >
                Clear all
              </button>
            </div>
          )}

          {shown.length === 0 ? (
            <EmptyState q={q} hasFilters={activeCount > 0} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {shown.map(({ p }, i) => (
                <ProductCard key={p.id} p={p} priority={i < 4} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-bold">{title}</legend>
      {hint && <p className="-mt-1 mb-2 text-xs text-subtle">{hint}</p>}
      {children}
    </fieldset>
  );
}

function DeptLink({ q, slug, active, label, count }: { q: string; slug: string; active: boolean; label: string; count?: number }) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (slug) sp.set("dept", slug);
  return (
    <Link
      href={`/s${sp.size ? `?${sp}` : ""}`}
      className={`flex justify-between rounded px-1 py-0.5 ${active ? "font-bold" : "hover:text-link-hover"}`}
      aria-current={active ? "page" : undefined}
    >
      <span>{label}</span>
      {count !== undefined && <span className="text-xs font-normal text-subtle">{count}</span>}
    </Link>
  );
}

function PriceRange({ min, max, onApply }: { min: string; max: string; onApply: (min: string, max: string) => void }) {
  const [a, setA] = useState(min);
  const [b, setB] = useState(max);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(a.replace(/\D/g, ""), b.replace(/\D/g, ""));
      }}
    >
      <input value={a} onChange={(e) => setA(e.target.value)} inputMode="numeric" placeholder="Min" className="field w-full px-2 py-1" aria-label="Minimum total price" />
      <span className="text-subtle">–</span>
      <input value={b} onChange={(e) => setB(e.target.value)} inputMode="numeric" placeholder="Max" className="field w-full px-2 py-1" aria-label="Maximum total price" />
      <button className="btn-ghost shrink-0 px-3 py-1">Go</button>
    </form>
  );
}

function Chip({ children, onClear }: { children: string | string[]; onClear: () => void }) {
  const label = ([] as string[]).concat(children).join("");
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white py-1 pr-1 pl-3">
      {children}
      <button onClick={onClear} className="rounded-full p-0.5 hover:bg-[#f0f2f2]" aria-label={`Remove filter: ${label}`}>
        <XIcon className="size-3.5" />
      </button>
    </span>
  );
}

function EmptyState({ q, hasFilters }: { q: string; hasFilters: boolean }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-lg font-bold">{hasFilters ? "Nothing matches these filters" : `No results for "${q}"`}</p>
      <p className="mt-2 text-sm text-subtle">
        {hasFilters ? "Try removing a filter above." : "Check the spelling, or try a broader word like \"phone\", \"shirt\" or \"kitchen\"."}
      </p>
      <Link href="/s" className="btn-ghost mt-4">
        Browse everything
      </Link>
    </div>
  );
}
