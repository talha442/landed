"use client";

import { useState } from "react";

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
// US men's-ish scale with UK and EU equivalents on the button, so nobody has to look it up.
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
 * twice. Here you type your height and weight and it picks the size.
 */
export function recommendSize(heightCm: number, weightKg: number) {
  const byWeight = [55, 65, 76, 87, 99].findIndex((w) => weightKg < w);
  let i = byWeight === -1 ? APPAREL.length - 1 : byWeight;
  if (heightCm >= 188) i += 1;
  if (heightCm < 160) i -= 1;
  return APPAREL[Math.max(0, Math.min(APPAREL.length - 1, i))];
}

export function SizePicker({
  kind,
  value,
  onChange,
  error,
}: {
  kind: "apparel" | "shoes";
  value: string | null;
  onChange: (s: string) => void;
  error: boolean;
}) {
  const [finderOpen, setFinderOpen] = useState(false);
  const options = kind === "apparel" ? APPAREL.map((s) => ({ value: s, label: s, sub: "" })) : SHOES.map((s) => ({ value: `US ${s.us}`, label: `US ${s.us}`, sub: `UK ${s.uk} · EU ${s.eu}` }));

  return (
    <section id="size-picker" aria-labelledby="size-label">
      <div className="flex items-baseline justify-between gap-2">
        <p id="size-label" className="text-sm">
          Size: <span className="font-bold">{value ?? "Choose one"}</span>
        </p>
        {kind === "apparel" && (
          <button className="link text-sm" onClick={() => setFinderOpen((o) => !o)} aria-expanded={finderOpen}>
            Find my size
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="size-label">
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-w-12 rounded-md border px-3 py-1.5 text-sm ${
              value === o.value ? "border-link bg-[#edfdff] font-bold ring-1 ring-link" : "border-[#888c8c] hover:bg-[#f7fafa]"
            }`}
          >
            {o.label}
            {o.sub && <span className="block text-[11px] font-normal text-muted">{o.sub}</span>}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-deal" role="alert">
          Choose a size first.
        </p>
      )}
      {finderOpen && kind === "apparel" && <SizeFinder onPick={(s) => onChange(s)} />}
    </section>
  );
}

function SizeFinder({ onPick }: { onPick: (s: string) => void }) {
  const [metric, setMetric] = useState(true);
  const [h, setH] = useState("");
  const [h2, setH2] = useState("");
  const [w, setW] = useState("");

  const heightCm = metric ? Number(h) : (Number(h) * 12 + Number(h2 || 0)) * 2.54;
  const weightKg = metric ? Number(w) : Number(w) * 0.4536;
  const valid = heightCm > 120 && heightCm < 230 && weightKg > 30 && weightKg < 250;
  const rec = valid ? recommendSize(heightCm, weightKg) : null;

  return (
    <div className="mt-3 max-w-sm rounded-lg bg-[#f7f8f8] p-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-bold">Your measurements</p>
        <button className="link text-xs" onClick={() => (setMetric((m) => !m), setH(""), setH2(""), setW(""))}>
          Use {metric ? "ft / lb" : "cm / kg"}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        {metric ? (
          <label className="flex-1">
            <span className="text-xs text-muted">Height (cm)</span>
            <input className="field mt-0.5" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} placeholder="175" />
          </label>
        ) : (
          <>
            <label className="flex-1">
              <span className="text-xs text-muted">Height (ft)</span>
              <input className="field mt-0.5" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} placeholder="5" />
            </label>
            <label className="flex-1">
              <span className="text-xs text-muted">(in)</span>
              <input className="field mt-0.5" inputMode="numeric" value={h2} onChange={(e) => setH2(e.target.value)} placeholder="10" />
            </label>
          </>
        )}
        <label className="flex-1">
          <span className="text-xs text-muted">Weight ({metric ? "kg" : "lb"})</span>
          <input className="field mt-0.5" inputMode="numeric" value={w} onChange={(e) => setW(e.target.value)} placeholder={metric ? "72" : "160"} />
        </label>
      </div>
      <div className="mt-3 min-h-9" aria-live="polite">
        {rec && (
          <div className="flex items-center justify-between gap-2">
            <p>
              We recommend <span className="text-base font-bold">{rec}</span>
            </p>
            <button className="btn-ghost py-1" onClick={() => onPick(rec)}>
              Select {rec}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
