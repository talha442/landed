"use client";

import { Star } from "lucide-react";
import { useId, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import type { Destination } from "@/lib/shipping";
import type { Filters } from "./useFilters";

export type Facets = {
  categories: { slug: string; name: string; count: number }[];
  brands: { name: string; count: number }[];
  /** Delivered-total bounds for the current results, in local currency. */
  priceRange: [number, number];
};

type Props = {
  facets: Facets;
  filters: Filters;
  dest: Destination;
  setList: (key: "category" | "brand", values: string[]) => void;
  setValue: (key: string, value: string | number | null) => void;
  setPrice: (min: number | null, max: number | null) => void;
};

const RATINGS = [
  { value: "4.5", label: "4.5 & up" },
  { value: "4", label: "4 & up" },
  { value: "3", label: "3 & up" },
  { value: "0", label: "Any rating" },
];

/** Five filters that matter, instead of the forty-odd groups on Amazon's sidebar. */
export function FilterPanel({ facets, filters, dest, setList, setValue, setPrice }: Props) {
  // Rendered twice (sidebar and mobile sheet), so ids must be unique per instance
  // or labels point at the hidden copy and the visible controls lose their names.
  const uid = useId();
  const toggle = (key: "category" | "brand", list: string[], v: string, on: boolean) => setList(key, on ? [...list, v] : list.filter((x) => x !== v));
  const [showAllBrands, setShowAllBrands] = useState(false);
  const brands = showAllBrands ? facets.brands : facets.brands.slice(0, 6);

  return (
    <Accordion type="multiple" defaultValue={["category", "price", "rating", "delivery", "brand"]} className="w-full">
      <AccordionItem value="category">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Department</AccordionTrigger>
        <AccordionContent className="space-y-2.5">
          {facets.categories.map((c) => {
            const id = `${uid}-cat-${c.slug}`;
            return (
              <div key={c.slug} className="flex items-center gap-2.5">
                <Checkbox id={id} checked={filters.categories.includes(c.slug)} onCheckedChange={(v) => toggle("category", filters.categories, c.slug, v === true)} />
                <Label htmlFor={id} className="flex-1 cursor-pointer font-normal">
                  {c.name}
                </Label>
                <span className="text-xs text-muted-foreground tabular">{c.count}</span>
              </div>
            );
          })}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="price">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Delivered price</AccordionTrigger>
        <AccordionContent>
          <PriceSlider key={`${dest.code}|${filters.min}|${filters.max}|${facets.priceRange.join("-")}`} range={facets.priceRange} filters={filters} currency={dest.currency} onCommit={setPrice} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rating">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Customer rating</AccordionTrigger>
        <AccordionContent>
          <RadioGroup value={String(filters.rating)} onValueChange={(v) => setValue("rating", Number(v) || null)} className="gap-2.5">
            {RATINGS.map((r) => (
              <div key={r.value} className="flex items-center gap-2.5">
                <RadioGroupItem value={r.value} id={`${uid}-rating-${r.value}`} />
                <Label htmlFor={`${uid}-rating-${r.value}`} className="flex cursor-pointer items-center gap-1 font-normal">
                  {r.value !== "0" && <Star className="size-3.5 fill-star text-star" />}
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="delivery">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">Arrives in {dest.name}</AccordionTrigger>
        <AccordionContent>
          <RadioGroup value={String(filters.within)} onValueChange={(v) => setValue("by", Number(v) || null)} className="gap-2.5">
            {[
              { v: "7", l: "Within a week" },
              { v: "14", l: "Within 2 weeks" },
              { v: "30", l: "Within a month" },
              { v: "0", l: "Any time" },
            ].map((o) => (
              <div key={o.v} className="flex items-center gap-2.5">
                <RadioGroupItem value={o.v} id={`${uid}-by-${o.v}`} />
                <Label htmlFor={`${uid}-by-${o.v}`} className="cursor-pointer font-normal">
                  {o.l}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </AccordionContent>
      </AccordionItem>

      {facets.brands.length > 0 && (
        <AccordionItem value="brand" className="border-b-0">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Brand</AccordionTrigger>
          <AccordionContent className="space-y-2.5">
            {brands.map((b) => {
              const id = `${uid}-brand-${b.name}`;
              return (
                <div key={b.name} className="flex items-center gap-2.5">
                  <Checkbox id={id} checked={filters.brands.includes(b.name)} onCheckedChange={(v) => toggle("brand", filters.brands, b.name, v === true)} />
                  <Label htmlFor={id} className="flex-1 cursor-pointer font-normal">
                    {b.name}
                  </Label>
                  <span className="text-xs text-muted-foreground tabular">{b.count}</span>
                </div>
              );
            })}
            {facets.brands.length > 6 && (
              <button className="text-sm font-semibold hover:underline" onClick={() => setShowAllBrands((s) => !s)}>
                {showAllBrands ? "Show fewer" : `Show all ${facets.brands.length}`}
              </button>
            )}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

function PriceSlider({ range, filters, currency, onCommit }: { range: [number, number]; filters: Filters; currency: string; onCommit: (min: number | null, max: number | null) => void }) {
  const [lo, hi] = range;
  const step = niceStep(hi - lo);
  const [value, setValue] = useState<[number, number]>([Math.max(lo, filters.min ?? lo), Math.min(hi, filters.max ?? hi)]);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  if (hi <= lo) return <p className="text-sm text-muted-foreground">Only one price in these results.</p>;
  return (
    <div className="px-1 pt-2">
      <Slider
        min={lo}
        max={hi}
        step={step}
        value={value}
        onValueChange={(v) => setValue([v[0], v[1]])}
        onValueCommit={(v) => onCommit(v[0] <= lo ? null : v[0], v[1] >= hi ? null : v[1])}
        aria-label="Delivered price range"
      />
      <div className="mt-3 flex items-center justify-between text-xs tabular">
        <span className="rounded-md border px-2 py-1">
          {currency} {fmt(value[0])}
        </span>
        <span className="text-muted-foreground">to</span>
        <span className="rounded-md border px-2 py-1">
          {currency} {fmt(value[1])}
          {value[1] >= hi ? "+" : ""}
        </span>
      </div>
    </div>
  );
}

function niceStep(span: number) {
  const raw = span / 50;
  const mag = 10 ** Math.floor(Math.log10(Math.max(1, raw)));
  return Math.max(1, Math.ceil(raw / mag) * mag);
}
