"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_PREFS, useHydrated, useStore, type DisplayPrefs } from "@/lib/store";
import { Button } from "@/components/ui/button";

const TEXT: { value: DisplayPrefs["text"]; label: string; sample: string }[] = [
  { value: "default", label: "Default", sample: "text-[15px]" },
  { value: "large", label: "Large", sample: "text-[17px]" },
  { value: "larger", label: "Larger", sample: "text-[19px]" },
];

const TOGGLES: { key: "reduceMotion" | "underlineLinks" | "highContrast"; label: string; hint: string }[] = [
  { key: "reduceMotion", label: "Reduce motion", hint: "Turns off animations, slides and smooth scrolling. Also follows your system setting." },
  { key: "underlineLinks", label: "Underline links", hint: "Makes every link in page content easy to spot without relying on colour." },
  { key: "highContrast", label: "Higher contrast", hint: "Darker secondary text and stronger borders and focus rings." },
];

export function DisplayPrefsForm() {
  const hydrated = useHydrated();
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);

  if (!hydrated) return <Skeleton className="h-72 rounded-3xl" />;

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold">Text size</legend>
        <RadioGroup value={prefs.text} onValueChange={(v) => setPrefs({ text: v as DisplayPrefs["text"] })} className="mt-3 grid gap-2 sm:grid-cols-3">
          {TEXT.map((t) => (
            <Label
              key={t.value}
              htmlFor={`text-${t.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-4 font-normal has-data-checked:border-foreground has-data-checked:bg-muted/40"
            >
              <RadioGroupItem value={t.value} id={`text-${t.value}`} />
              <span>
                <span className="block font-semibold">{t.label}</span>
                <span className={`${t.sample} text-muted-foreground`} aria-hidden>
                  Aa
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <ul className="divide-y rounded-2xl border bg-card">
        {TOGGLES.map((t) => (
          <li key={t.key} className="flex items-start justify-between gap-6 p-4">
            <div>
              <Label htmlFor={`pref-${t.key}`} className="text-sm font-semibold">
                {t.label}
              </Label>
              <p id={`pref-${t.key}-hint`} className="mt-1 text-sm text-muted-foreground">
                {t.hint}
              </p>
            </div>
            <Switch
              id={`pref-${t.key}`}
              checked={prefs[t.key]}
              onCheckedChange={(v) => setPrefs({ [t.key]: v })}
              aria-describedby={`pref-${t.key}-hint`}
              className="mt-0.5"
            />
          </li>
        ))}
      </ul>

      <Button variant="outline" onClick={() => setPrefs(DEFAULT_PREFS)}>
        Reset display settings
      </Button>
    </div>
  );
}
