"use client";

import { Scale, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deliveryWindow, estimateOne, formatWindow, money } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { Stars } from "./ProductRating";

/**
 * On amazon.com, comparing three items means three tabs, and the shipping and import
 * fees sit in a different place on each page. Here you tick "Compare" on up to four
 * cards and see the delivered totals side by side.
 */
export function CompareTray() {
  const hydrated = useHydrated();
  const items = useStore((s) => s.compare);
  const { toggleCompare, clearCompare } = useStore.getState();
  const pathname = usePathname();

  if (!hydrated || items.length === 0 || pathname.startsWith("/checkout")) return null;

  return (
    <>
      {/* Spacer so the fixed tray never covers the end of the page. */}
      <div className="h-20" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4" role="region" aria-label="Compare tray">
        <div className="mx-auto flex max-w-2xl animate-in items-center gap-3 rounded-2xl border bg-card/95 p-2.5 pl-4 shadow-2xl shadow-black/10 backdrop-blur slide-in-from-bottom-4 fade-in-0">
          <Scale className="hidden size-5 shrink-0 text-muted-foreground sm:block" aria-hidden />
          <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1.5">
            {items.map((p) => (
              <li key={p.id} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt={p.name} title={p.name} className="size-11 rounded-lg border bg-[#f3f2ee] object-contain p-0.5" />
                <button
                  onClick={() => toggleCompare(p)}
                  className="absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-full border-2 border-card bg-foreground text-background"
                  aria-label={`Remove ${p.name} from compare`}
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={items.length < 2} title={items.length < 2 ? "Pick at least 2 items" : undefined}>
                Compare {items.length}
              </Button>
            </DialogTrigger>
            <CompareDialog items={items} />
          </Dialog>
        </div>
      </div>
    </>
  );
}

function CompareDialog({ items }: { items: ProductSummary[] }) {
  const dest = useDestination();
  const rows = items.map((p) => ({ p, e: estimateOne(p.price, dest), w: deliveryWindow(p.deliveryInfo, dest) }));
  const cheapest = Math.min(...rows.map((r) => r.e.total));
  const fastest = Math.min(...rows.map((r) => r.w.maxDays));
  const bestRated = Math.max(...rows.map((r) => r.p.rating));
  const best = "bg-brand-soft font-semibold text-brand";

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[min(96vw,980px)]">
      <DialogHeader>
        <DialogTitle className="font-heading text-xl">Compare, delivered to {dest.name}</DialogTitle>
        <DialogDescription>Totals include shipping and {dest.dutyLabel.toLowerCase()}, as if each were ordered on its own. The best in each row is highlighted.</DialogDescription>
      </DialogHeader>
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[540px] table-fixed border-collapse text-sm">
          <thead>
            <tr>
              <td className="w-28" />
              {rows.map(({ p }) => (
                <th key={p.id} className="px-2 pb-3 text-left align-top font-normal">
                  <Link href={`/product/${p.id}`} className="group block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail} alt="" className="mb-2 aspect-square w-full rounded-xl bg-[#f3f2ee] object-contain p-3" />
                    <span className="line-clamp-2 font-semibold group-hover:underline">{p.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_td]:px-2 [&_td]:py-2.5 [&_td]:align-top">
            <Row label="You pay">
              {rows.map(({ p, e }) => (
                <td key={p.id} className={cn("rounded-md text-base font-bold tabular", e.total === cheapest && best)}>
                  {money(e.total, dest)}
                  {e.total === cheapest && <BestTag>Lowest</BestTag>}
                </td>
              ))}
            </Row>
            <Row label="Item">
              {rows.map(({ p, e }) => (
                <td key={p.id} className="tabular">{money(e.items, dest)}</td>
              ))}
            </Row>
            <Row label="Shipping & import">
              {rows.map(({ p, e }) => (
                <td key={p.id} className="tabular">{money(e.shipping + e.duties, dest)}</td>
              ))}
            </Row>
            <Row label="Arrives">
              {rows.map(({ p, w }) => (
                <td key={p.id} className={cn("rounded-md", w.maxDays === fastest && best)}>
                  {formatWindow(w)}
                  {w.maxDays === fastest && <BestTag>Fastest</BestTag>}
                </td>
              ))}
            </Row>
            <Row label="Rating">
              {rows.map(({ p }) => (
                <td key={p.id} className={cn("rounded-md", p.rating === bestRated && best)}>
                  <span className="flex items-center gap-1.5">
                    {p.rating.toFixed(1)} <Stars rating={p.rating} />
                  </span>
                  {p.rating === bestRated && <BestTag>Top rated</BestTag>}
                </td>
              ))}
            </Row>
            <Row label="Warranty">
              {rows.map(({ p }) => (
                <td key={p.id}>{p.warranty}</td>
              ))}
            </Row>
            <Row label="Returns">
              {rows.map(({ p }) => (
                <td key={p.id}>{p.returnPolicy}</td>
              ))}
            </Row>
            <tr className="border-t">
              <th scope="row" className="w-28">
                <span className="sr-only">Add to cart</span>
              </th>
              {rows.map(({ p }) => (
                <td key={p.id}>
                  {p.sizeKind ? (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/product/${p.id}`}>Choose size</Link>
                    </Button>
                  ) : (
                    <AddToCartButton productId={p.id} name={p.name} buttonSize="sm" className="w-full" label="Add" />
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </DialogContent>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t">
      <th scope="row" className="w-28 py-2.5 pr-3 text-left align-top text-xs font-medium text-muted-foreground">
        {label}
      </th>
      {children}
    </tr>
  );
}

/** The best value in a row is marked in words too, not only by colour (WCAG 1.4.1). */
function BestTag({ children }: { children: string }) {
  return <span className="mt-0.5 block text-[11px] font-semibold tracking-wide uppercase">{children}</span>;
}
