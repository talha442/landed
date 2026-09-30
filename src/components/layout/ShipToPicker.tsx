"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { destinations } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";

/** Where it ships decides the price: currency, shipping and import charges all follow. */
export function ShipToPicker({ className, compact }: { className?: string; compact?: boolean }) {
  const dest = useDestination();
  const setShipTo = useStore((s) => s.setShipTo);
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-left text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:bg-muted",
          className,
        )}
      >
        <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="leading-tight">
          {!compact && <span className="block text-[11px] text-muted-foreground">Deliver to</span>}
          <span className="font-semibold">
            {compact && <span className="font-normal text-muted-foreground">Deliver to </span>}
            {hydrated ? dest.name : "…"}
            <span className="ml-1 font-normal text-muted-foreground">{hydrated ? dest.currency : ""}</span>
          </span>
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="w-80 gap-3 p-4">
        <div>
          <p className="font-heading text-base font-bold">Where are we delivering?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Every price updates to the delivered total for this country, in its currency: item, shipping and import charges together.
          </p>
        </div>
        <div className="space-y-1" role="radiogroup" aria-label="Destination country">
          {destinations.map((d) => {
            const active = d.code === dest.code;
            return (
              <button
                key={d.code}
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setShipTo(d.code);
                  setOpen(false);
                  if (!active) toast(`Now showing prices delivered to ${d.name}`, { description: `In ${d.currency}, with shipping and ${d.dutyLabel.toLowerCase()} included.` });
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                  active && "bg-brand-soft font-semibold text-brand hover:bg-brand-soft",
                )}
              >
                <span>{d.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {d.currency}
                  {active && <Check className="size-4 text-brand" />}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
