"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./AddressForm";

export type CardDetails = { number: string; name: string; expiry: string; cvc: string };

export const TEST_CARDS = {
  success: "4242 4242 4242 4242",
  declined: "4000 0000 0000 0002",
};

/**
 * This is a demo on a public URL, so it must never look like it takes real cards.
 * Only the published test numbers are accepted; anything else is rejected before
 * "payment", and nothing typed here is stored except the last four digits.
 */
export function validateCard(c: CardDetails) {
  const errors: Partial<Record<keyof CardDetails, string>> = {};
  const digits = c.number.replace(/\D/g, "");
  if (digits.length < 16) errors.number = "Enter the 16-digit card number.";
  else if (![TEST_CARDS.success, TEST_CARDS.declined].map((n) => n.replace(/\s/g, "")).includes(digits))
    errors.number = "This demo only accepts test cards. Use 4242 4242 4242 4242.";
  if (!c.name.trim()) errors.name = "Enter the name on the card.";
  const m = c.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) errors.expiry = "Use MM / YY.";
  else if (new Date(2000 + Number(m[2]), Number(m[1])) < new Date()) errors.expiry = "This card has expired.";
  if (!/^\d{3,4}$/.test(c.cvc)) errors.cvc = "3 or 4 digits.";
  return errors;
}

const formatNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

export function PaymentForm({ value, onChange, errors }: { value: CardDetails; onChange: (c: CardDetails) => void; errors: Partial<Record<keyof CardDetails, string>> }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed bg-muted/50 px-3.5 py-2.5 text-xs">
        <span className="text-muted-foreground">
          Demo mode. Test card <span className="font-mono font-semibold text-foreground">4242 4242 4242 4242</span> succeeds,{" "}
          <span className="font-mono font-semibold text-foreground">4000 0000 0000 0002</span> is declined.
        </span>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange({ number: TEST_CARDS.success, name: value.name || "Test Shopper", expiry: "12 / 30", cvc: "123" })}>
          Fill test card
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="card-number" label="Card number" className="sm:col-span-2" error={errors.number}>
          <div className="relative">
            <Input
              id="card-number"
              inputMode="numeric"
              autoComplete="off"
              placeholder="1234 1234 1234 1234"
              value={value.number}
              onChange={(e) => onChange({ ...value, number: formatNumber(e.target.value) })}
              aria-invalid={!!errors.number || undefined}
              className="h-11 rounded-xl pr-10 font-mono tabular"
            />
            <CreditCard className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Field id="card-name" label="Name on card" className="sm:col-span-2" error={errors.name}>
          <Input id="card-name" autoComplete="off" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} aria-invalid={!!errors.name || undefined} className="h-11 rounded-xl" />
        </Field>
        <Field id="card-expiry" label="Expiry" error={errors.expiry}>
          <Input
            id="card-expiry"
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM / YY"
            value={value.expiry}
            onChange={(e) => onChange({ ...value, expiry: formatExpiry(e.target.value) })}
            aria-invalid={!!errors.expiry || undefined}
            className="h-11 rounded-xl tabular"
          />
        </Field>
        <Field id="card-cvc" label="Security code" error={errors.cvc}>
          <Input
            id="card-cvc"
            inputMode="numeric"
            autoComplete="off"
            placeholder="123"
            value={value.cvc}
            onChange={(e) => onChange({ ...value, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            aria-invalid={!!errors.cvc || undefined}
            className="h-11 rounded-xl tabular"
          />
        </Field>
      </div>
    </div>
  );
}
