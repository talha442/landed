"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckIcon } from "@/components/icons";
import { destinations, estimate, formatWindow, money, orderDeliveryWindow, type Speed } from "@/lib/shipping";
import { useCurrentUser, useHydrated, useStore, type Address, type Order } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useResolvedLines } from "@/lib/useCartLines";
import { useDestination } from "@/lib/useDestination";

// Cash on delivery is how most people pay online in Pakistan, India and the UAE.
// Amazon's international checkout doesn't offer it.
const COD_COUNTRIES = new Set(["PK", "IN", "AE"]);

const EMPTY: Address = { name: "", phone: "", line1: "", city: "", postcode: "", country: "" };

export function CheckoutView({ catalog }: { catalog: ProductSummary[] }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const dest = useDestination();
  const user = useCurrentUser();
  const cart = useStore((s) => s.cart);
  const setShipTo = useStore((s) => s.setShipTo);
  const lines = useResolvedLines(cart, catalog);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<Address | null>(null);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [speed, setSpeed] = useState<Speed>("standard");
  const [payment, setPayment] = useState<"cod" | "card" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  if (!hydrated || placing) {
    return (
      <div className="mx-auto max-w-[1150px] px-3 py-6">
        <div className="card h-80 animate-pulse" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1150px] px-3 py-10">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-medium">Nothing to check out</h1>
          <p className="mt-2 text-sm text-muted">Your cart is empty.</p>
          <Link href="/s" className="btn-cta mt-4">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  const saved = user?.address && user.address.country === dest.code ? user.address : null;
  const addr = address ?? saved;
  const showForm = editing || !addr;
  const codAvailable = COD_COUNTRIES.has(dest.code);
  const pay = payment ?? (codAvailable ? "cod" : "card");

  const cost = lines.map((l) => ({ price: l.product.price, qty: l.qty }));
  const e = estimate(cost, dest, speed);
  const infos = lines.map((l) => l.product.shippingInformation);

  function place() {
    const problems: string[] = [];
    if (!addr || showForm) problems.push("Add a delivery address and press Use this address.");
    if (!user && email && !/^\S+@\S+\.\S+$/.test(email)) problems.push("That email address doesn't look right.");
    setErrors(problems);
    if (problems.length || !addr) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const w = orderDeliveryWindow(infos, dest, speed);
    const order: Order = {
      id: `${rand(3)}-${rand(7)}-${rand(7)}`,
      createdAt: new Date().toISOString(),
      email: user?.email ?? (email || null),
      lines: lines.map((l) => ({ productId: l.productId, title: l.product.title, thumbnail: l.product.thumbnail, price: l.product.price, qty: l.qty, size: l.size })),
      destination: dest.code,
      speed,
      estimate: e,
      address: addr,
      payment: pay,
      deliveryFrom: w.from.toISOString(),
      deliveryTo: w.to.toISOString(),
      status: "placed",
    };
    setPlacing(true);
    const s = useStore.getState();
    if (user) s.saveAddress(user.email, addr);
    s.placeOrder(order);
    router.push(`/orders/${order.id}?placed=1`);
  }

  return (
    <div className="mx-auto max-w-[1150px] px-3 py-4">
      {errors.length > 0 && (
        <div className="mb-4 rounded-lg border border-deal bg-[#fff5f5] p-4 text-sm" role="alert">
          <p className="font-bold text-deal">There&apos;s a problem</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Step n={1} title={`Delivering to ${dest.name}`} done={!showForm}>
            {!user && (
              <p className="mb-3 text-sm">
                Checking out as a guest.{" "}
                <Link href="/signin?next=/checkout" className="link">
                  Sign in
                </Link>{" "}
                to use a saved address and keep this order in your history.
              </p>
            )}
            {showForm ? (
              <AddressForm
                initial={addr ?? { ...EMPTY, name: user?.name ?? "" }}
                country={dest.name}
                onChangeCountry={(code) => setShipTo(code)}
                countryCode={dest.code}
                onSubmit={(a) => {
                  setAddress({ ...a, country: dest.code });
                  setEditing(false);
                  setErrors([]);
                }}
                onCancel={addr ? () => setEditing(false) : undefined}
              />
            ) : (
              <div className="flex items-start justify-between gap-4 text-sm">
                <address className="not-italic">
                  <span className="font-bold">{addr!.name}</span>
                  <br />
                  {addr!.line1}, {addr!.city} {addr!.postcode}, {dest.name}
                  <br />
                  <span className="text-muted">{addr!.phone}</span>
                </address>
                <button className="link shrink-0" onClick={() => setEditing(true)}>
                  Change
                </button>
              </div>
            )}
            {!user && !showForm && (
              <label className="mt-4 block max-w-sm text-sm">
                <span className="font-bold">Email for order updates</span> <span className="text-muted">(optional)</span>
                <input type="email" className="field mt-1" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="you@example.com" />
              </label>
            )}
          </Step>

          <Step n={2} title="Delivery speed" done>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["standard", "express"] as const).map((sp) => {
                const est = estimate(cost, dest, sp);
                const w = orderDeliveryWindow(infos, dest, sp);
                return (
                  <label
                    key={sp}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${speed === sp ? "border-link bg-[#edfdff] ring-1 ring-link" : "border-line hover:bg-[#f7fafa]"}`}
                  >
                    <input type="radio" name="speed" checked={speed === sp} onChange={() => setSpeed(sp)} className="mt-0.5 accent-link" />
                    <span>
                      <span className="font-bold">{formatWindow(w)}</span>
                      <span className="block text-muted">
                        {sp === "standard" ? "Standard" : "Express"} · {est.shipping ? `${money(est.shipping, dest)} shipping` : "Free shipping"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Step>

          <Step n={3} title="Payment" done>
            <div className="space-y-2">
              {codAvailable && (
                <PayOption checked={pay === "cod"} onChange={() => setPayment("cod")} title="Cash on delivery" sub={`Pay ${money(e.total, dest)} to the courier when it arrives.`} />
              )}
              <PayOption
                checked={pay === "card"}
                onChange={() => setPayment("card")}
                title="Test card •••• 4242"
                sub="Simulated payment. This is a demo, so no card details are collected and nothing is charged."
              />
            </div>
          </Step>

          <Step n={4} title={`Review ${e.itemCount} ${e.itemCount === 1 ? "item" : "items"}`} done>
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3 py-2 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.product.thumbnail} alt="" className="size-14 rounded bg-[#f7f8f8] object-contain p-1 mix-blend-multiply" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1">{l.product.title}</span>
                    <span className="text-xs text-muted">
                      Qty {l.qty}
                      {l.size && ` · Size ${l.size}`}
                    </span>
                  </span>
                  <span className="font-bold">{money(l.product.price * l.qty, dest)}</span>
                </li>
              ))}
            </ul>
            <Link href="/cart" className="link mt-2 inline-block text-sm">
              Edit cart
            </Link>
          </Step>
        </div>

        <aside className="card space-y-3 p-4 lg:sticky lg:top-4" aria-label="Order total">
          <button className="btn-cta w-full" onClick={place}>
            Place your order
          </button>
          <dl className="space-y-1.5 border-t border-line pt-3 text-sm">
            <Line label={`Items (${e.itemCount})`} value={money(e.items, dest)} />
            <Line label={`Shipping (${speed})`} value={e.shipping ? money(e.shipping, dest) : "Free"} />
            <Line label={`${dest.dutyLabel} (est.)`} value={money(e.duties, dest)} />
            <div className="flex justify-between border-t border-line pt-2 text-lg font-bold text-[#b12704]">
              <dt>Order total</dt>
              <dd>{money(e.total, dest)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted">
            Same currency and same total as your cart. Import charges are collected now, so there&apos;s nothing to pay at the door
            {codAvailable && pay === "cod" ? " beyond this total" : ""}.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="card p-4 sm:p-6" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-3 flex items-center gap-2 text-lg font-bold">
        <span className={`flex size-6 items-center justify-center rounded-full text-xs ${done ? "bg-ok text-white" : "bg-ink text-white"}`}>
          {done ? <CheckIcon className="size-3.5" /> : n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function PayOption({ checked, onChange, title, sub }: { checked: boolean; onChange: () => void; title: string; sub: string }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${checked ? "border-link bg-[#edfdff] ring-1 ring-link" : "border-line hover:bg-[#f7fafa]"}`}>
      <input type="radio" name="payment" checked={checked} onChange={onChange} className="mt-0.5 accent-link" />
      <span>
        <span className="font-bold">{title}</span>
        <span className="block text-muted">{sub}</span>
      </span>
    </label>
  );
}

function AddressForm({
  initial,
  country,
  countryCode,
  onChangeCountry,
  onSubmit,
  onCancel,
}: {
  initial: Address;
  country: string;
  countryCode: string;
  onChangeCountry: (code: string) => void;
  onSubmit: (a: Address) => void;
  onCancel?: () => void;
}) {
  const [a, setA] = useState(initial);
  const [touched, setTouched] = useState(false);
  const set = (k: keyof Address) => (ev: React.ChangeEvent<HTMLInputElement>) => setA({ ...a, [k]: ev.target.value });
  const missing = (["name", "phone", "line1", "city"] as const).filter((k) => !a[k].trim());

  return (
    <form
      className="grid max-w-xl gap-3 sm:grid-cols-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        setTouched(true);
        if (missing.length === 0) onSubmit(a);
      }}
      noValidate
    >
      <label className="text-sm sm:col-span-2">
        <span className="font-bold">Country</span>
        <select className="field mt-1" value={countryCode} onChange={(ev) => onChangeCountry(ev.target.value)}>
          {destinations.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-muted">Changing country updates shipping, import charges and currency. Currently {country}.</span>
      </label>
      <Field label="Full name" value={a.name} onChange={set("name")} error={touched && !a.name.trim()} autoComplete="name" />
      <Field label="Phone" value={a.phone} onChange={set("phone")} error={touched && !a.phone.trim()} autoComplete="tel" type="tel" />
      <Field label="Address" value={a.line1} onChange={set("line1")} error={touched && !a.line1.trim()} autoComplete="street-address" className="sm:col-span-2" placeholder="House, street, area" />
      <Field label="City" value={a.city} onChange={set("city")} error={touched && !a.city.trim()} autoComplete="address-level2" />
      <Field label="Postcode" optional value={a.postcode} onChange={set("postcode")} autoComplete="postal-code" />
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-cta">Use this address</button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  optional,
  className = "",
  ...props
}: { label: string; error?: boolean; optional?: boolean; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="font-bold">{label}</span>
      {optional && <span className="text-muted"> (optional)</span>}
      <input className={`field mt-1 ${error ? "border-deal ring-2 ring-[#fbd7d7]" : ""}`} aria-invalid={error || undefined} {...props} />
      {error && <span className="mt-1 block text-xs text-deal">Enter your {label.toLowerCase()}</span>}
    </label>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function rand(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}
