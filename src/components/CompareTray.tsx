"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sizeKind } from "@/lib/catalog";
import { deliveryWindow, estimateOne, formatWindow, money } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { Stars } from "./Stars";
import { XIcon } from "./icons";

/**
 * On amazon.com, comparing three items means three tabs and flipping between them,
 * and the shipping and import fees are on a different part of each page. Here you
 * tick "Compare" on up to four cards and see the delivered totals side by side.
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
    <div className="h-16" aria-hidden />
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 shadow-[0_-4px_16px_rgba(15,17,17,.12)] backdrop-blur" role="region" aria-label="Compare tray">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2">
        <p className="hidden text-sm font-bold sm:block">Compare</p>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {items.map((p) => (
            <li key={p.id} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbnail} alt={p.title} title={p.title} className="size-12 rounded border border-line bg-[#f7f8f8] object-contain p-0.5 mix-blend-multiply" />
              <button
                onClick={() => toggleCompare(p)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-ink p-0.5 text-white"
                aria-label={`Remove ${p.title} from compare`}
              >
                <XIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
        <button className="link shrink-0 text-sm" onClick={clearCompare}>
          Clear
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <button className="btn-cta shrink-0" disabled={items.length < 2} title={items.length < 2 ? "Pick at least 2 items" : undefined}>
              Compare {items.length}
            </button>
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
  const add = useStore((s) => s.addToCart);

  const rows = items.map((p) => {
    const e = estimateOne(p.price, dest);
    const w = deliveryWindow(p.shippingInformation, dest);
    return { p, e, w };
  });
  const cheapest = Math.min(...rows.map((r) => r.e.total));
  const fastest = Math.min(...rows.map((r) => r.w.maxDays));
  const bestRated = Math.max(...rows.map((r) => r.p.rating));

  const best = "bg-[#e7f6f2] font-bold text-ok";

  return (
    <DialogContent className="max-h-[90vh] max-w-[min(96vw,1000px)] overflow-auto sm:max-w-[min(96vw,1000px)]">
      <DialogTitle className="text-xl">Compare delivered to {dest.name}</DialogTitle>
      <DialogDescription>Totals include shipping and {dest.dutyLabel.toLowerCase()}, each as if ordered on its own. Best in each row is highlighted.</DialogDescription>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32" />
              {rows.map(({ p }) => (
                <th key={p.id} className="p-2 text-left align-top font-normal">
                  <Link href={`/p/${p.id}`} className="group block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail} alt="" className="mb-2 aspect-square w-full rounded bg-[#f7f8f8] object-contain p-2 mix-blend-multiply" />
                    <span className="line-clamp-2 font-medium group-hover:text-link-hover">{p.title}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_td]:border-t [&_td]:border-line [&_td]:p-2 [&_th]:border-t [&_th]:border-line [&_th]:p-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-subtle">
            <tr>
              <th scope="row">You pay</th>
              {rows.map(({ p, e }) => (
                <td key={p.id} className={`text-base ${e.total === cheapest ? best : "font-bold"}`}>
                  {money(e.total, dest)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Item price</th>
              {rows.map(({ p, e }) => (
                <td key={p.id}>{money(e.items, dest)}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Shipping & import</th>
              {rows.map(({ p, e }) => (
                <td key={p.id}>{money(e.shipping + e.duties, dest)}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Arrives</th>
              {rows.map(({ p, w }) => (
                <td key={p.id} className={w.maxDays === fastest ? best : ""}>
                  {formatWindow(w)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Rating</th>
              {rows.map(({ p }) => (
                <td key={p.id} className={p.rating === bestRated ? best : ""}>
                  <span className="flex items-center gap-1">
                    {p.rating.toFixed(1)} <Stars rating={p.rating} className="size-3" />
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Brand</th>
              {rows.map(({ p }) => (
                <td key={p.id}>{p.brand ?? "Generic"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Warranty</th>
              {rows.map(({ p }) => (
                <td key={p.id}>{p.warranty}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Returns</th>
              {rows.map(({ p }) => (
                <td key={p.id}>{p.returnPolicy}</td>
              ))}
            </tr>
            <tr>
              <th scope="row" />
              {rows.map(({ p }) => (
                <td key={p.id}>
                  {sizeKind(p.category) ? (
                    <Link href={`/p/${p.id}`} className="btn-ghost w-full px-2">
                      Choose size
                    </Link>
                  ) : (
                    <button
                      className="btn-cta w-full px-2"
                      onClick={() => {
                        add(p.id);
                        toast.success("Added to cart", { description: p.title });
                      }}
                    >
                      Add to cart
                    </button>
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
