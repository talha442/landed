"use client";

import { Ruler } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
// US sizes with UK and EU on the button, so nobody has to look up a conversion chart.
const SHOES = [
  { us: "6", uk: "5.5", eu: "39" },
  { us: "7", uk: "6.5", eu: "40" },
  { us: "8", uk: "7.5", eu: "41" },
  { us: "9", uk: "8.5", eu: "42" },
  { us: "10", uk: "9.5", eu: "43" },
  { us: "11", uk: "10.5", eu: "44" },
  { us: "12", uk: "11.5", eu: "45" },
];

/**
 * Amazon's answer to "what size am I?" is a height × weight chart printed as an image,
 * twice. Here you type your height and weight and get a size.
 */
export function recommendSize(heightCm: number, weightKg: number) {
  const byWeight = [55, 65, 76, 87, 99].findIndex((w) => weightKg < w);
  let i = byWeight === -1 ? APPAREL.length - 1 : byWeight;
  if (heightCm >= 188) i += 1;
  if (heightCm < 160) i -= 1;
  return APPAREL[Math.max(0, Math.min(APPAREL.length - 1, i))];
}

export function SizePicker({ kind, value, onChange, error }: { kind: "apparel" | "shoes"; value: string | null; onChange: (s: string) => void; error: boolean }) {
  const options =
    kind === "apparel" ? APPAREL.map((s) => ({ value: s, label: s, sub: "" })) : SHOES.map((s) => ({ value: `US ${s.us}`, label: `US ${s.us}`, sub: `UK ${s.uk} · EU ${s.eu}` }));

  return (
    <div id="size-picker" className="scroll-mt-40">
      <div className="flex items-center justify-between gap-2">
        <p id="size-label" className="text-sm font-semibold">
          Size {value ? <span className="font-normal text-muted-foreground">· {value}</span> : null}
        </p>
        {kind === "apparel" && <SizeFinder onPick={onChange} />}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="size-label" aria-required aria-describedby={error && !value ? "size-error" : undefined}>
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-w-14 rounded-xl border bg-card px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
              value === o.value ? "border-foreground bg-foreground text-background" : "hover:border-foreground/40",
              error && !value && "border-destructive/60",
            )}
          >
            {o.label}
            {o.sub && <span className={cn("block text-[10px] font-normal", value === o.value ? "text-background/70" : "text-muted-foreground")}>{o.sub}</span>}
          </button>
        ))}
      </div>
      {error && !value && (
        <p id="size-error" className="mt-2 text-sm font-medium text-destructive" role="alert">
          Choose a size to continue.
        </p>
      )}
    </div>
  );
}

function SizeFinder({ onPick }: { onPick: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState(true);
  const [h, setH] = useState("");
  const [h2, setH2] = useState("");
  const [w, setW] = useState("");

  const heightCm = metric ? Number(h) : (Number(h) * 12 + Number(h2 || 0)) * 2.54;
  const weightKg = metric ? Number(w) : Number(w) * 0.4536;
  const valid = heightCm > 120 && heightCm < 230 && weightKg > 30 && weightKg < 250;
  const rec = valid ? recommendSize(heightCm, weightKg) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1.5 rounded-full text-sm font-semibold underline-offset-4 hover:underline">
        <Ruler className="size-4" /> Find my size
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-3 p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Your measurements</p>
          <button
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMetric((m) => !m);
              setH("");
              setH2("");
              setW("");
            }}
          >
            Use {metric ? "ft / lb" : "cm / kg"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {metric ? (
            <div className="space-y-1">
              <Label htmlFor="sf-h">Height (cm)</Label>
              <Input id="sf-h" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} placeholder="175" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-1">
                <Label htmlFor="sf-ft">ft</Label>
                <Input id="sf-ft" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} placeholder="5" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sf-in">in</Label>
                <Input id="sf-in" inputMode="numeric" value={h2} onChange={(e) => setH2(e.target.value)} placeholder="10" />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="sf-w">Weight ({metric ? "kg" : "lb"})</Label>
            <Input id="sf-w" inputMode="numeric" value={w} onChange={(e) => setW(e.target.value)} placeholder={metric ? "72" : "160"} />
          </div>
        </div>
        <div className="min-h-10" aria-live="polite">
          {rec ? (
            <div className="flex items-center justify-between rounded-xl bg-brand-soft p-2.5 pl-3.5">
              <p className="text-sm">
                Your size: <span className="text-lg font-bold text-brand">{rec}</span>
              </p>
              <Button
                size="sm"
                variant="brand"
                onClick={() => {
                  onPick(rec);
                  setOpen(false);
                }}
              >
                Select {rec}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Enter both and we&apos;ll pick a size. Fits true to size.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
