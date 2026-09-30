"use client";

import { cloneElement, isValidElement, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Address } from "@/lib/orders";
import { destinations } from "@/lib/shipping";
import { cn } from "@/lib/utils";

const REQUIRED = ["name", "phone", "line1", "city"] as const;
const LABELS: Record<(typeof REQUIRED)[number], string> = { name: "full name", phone: "phone number", line1: "street address", city: "city" };

export function emptyAddress(country: string, name = ""): Address {
  return { id: `addr-${Date.now().toString(36)}`, label: "Home", name, phone: "", line1: "", city: "", postcode: "", country };
}

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Use this address",
  showLabel = false,
}: {
  initial: Address;
  onSubmit: (a: Address) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showLabel?: boolean;
}) {
  const [a, setA] = useState(initial);
  const [touched, setTouched] = useState(false);
  const missing = REQUIRED.filter((k) => !a[k].trim());
  const err = (k: (typeof REQUIRED)[number]) => touched && !a[k].trim();
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setA({ ...a, [k]: e.target.value });

  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (missing.length === 0) onSubmit({ ...a, name: a.name.trim(), line1: a.line1.trim(), city: a.city.trim() });
        else document.getElementById(`addr-${missing[0]}`)?.focus();
      }}
    >
      {showLabel && (
        <Field id="addr-label" label="Label" className="sm:col-span-2">
          <Input id="addr-label" value={a.label} onChange={set("label")} placeholder="Home, Work…" />
        </Field>
      )}
      <Field id="addr-country" label="Country" className="sm:col-span-2" hint="Prices, shipping and import charges follow the country.">
        <Select value={a.country} onValueChange={(v) => setA({ ...a, country: v })}>
          <SelectTrigger id="addr-country" className="h-11 w-full rounded-xl bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {destinations.map((d) => (
              <SelectItem key={d.code} value={d.code}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field id="addr-name" label="Full name" error={err("name") ? `Enter your ${LABELS.name}` : undefined}>
        <Input id="addr-name" autoComplete="name" value={a.name} onChange={set("name")} aria-invalid={err("name") || undefined} className="h-11 rounded-xl" />
      </Field>
      <Field id="addr-phone" label="Phone" error={err("phone") ? `Enter your ${LABELS.phone}` : undefined}>
        <Input id="addr-phone" type="tel" autoComplete="tel" value={a.phone} onChange={set("phone")} aria-invalid={err("phone") || undefined} className="h-11 rounded-xl" />
      </Field>
      <Field id="addr-line1" label="Street address" className="sm:col-span-2" error={err("line1") ? `Enter your ${LABELS.line1}` : undefined}>
        <Input id="addr-line1" autoComplete="street-address" value={a.line1} onChange={set("line1")} placeholder="House, street, area" aria-invalid={err("line1") || undefined} className="h-11 rounded-xl" />
      </Field>
      <Field id="addr-city" label="City" error={err("city") ? `Enter your ${LABELS.city}` : undefined}>
        <Input id="addr-city" autoComplete="address-level2" value={a.city} onChange={set("city")} aria-invalid={err("city") || undefined} className="h-11 rounded-xl" />
      </Field>
      <Field id="addr-postcode" label="Postcode" optional>
        <Input id="addr-postcode" autoComplete="postal-code" value={a.postcode} onChange={set("postcode")} className="h-11 rounded-xl" />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function Field({ id, label, optional, hint, error, className, children }: { id: string; label: string; optional?: boolean; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  // Tie the message to the control so screen readers read it with the field (WCAG 1.3.1, 3.3.1).
  const msgId = error || hint ? `${id}-msg` : undefined;
  const control =
    msgId && isValidElement<{ "aria-describedby"?: string }>(children) ? cloneElement(children, { "aria-describedby": msgId }) : children;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {control}
      {error ? (
        <p id={msgId} className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
