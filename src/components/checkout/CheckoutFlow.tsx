"use client";

import { AlertCircle, Banknote, CreditCard, Loader2, Lock, MapPin, Pencil, Plus, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrderTotals } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/common/EmptyState";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { newOrderId, type Address, type Order } from "@/lib/orders";
import { estimate, formatWindow, getDestination, money, orderDeliveryWindow, type Speed } from "@/lib/shipping";
import { useCurrentUser, useHydrated, useStore } from "@/lib/store";
import type { ProductSummary } from "@/lib/types";
import { useResolvedLines, type ResolvedLine } from "@/lib/useCartLines";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";
import { AddressForm, emptyAddress } from "./AddressForm";
import { CheckoutSteps } from "./CheckoutSteps";
import { PaymentForm, TEST_CARDS, validateCard, type CardDetails } from "./PaymentForm";

// Cash on delivery is how most people pay online in Pakistan, India and the UAE.
const COD_COUNTRIES = new Set(["PK", "IN", "AE"]);

type Step = 1 | 2 | 3 | 4;

export function CheckoutFlow({ catalog }: { catalog: ProductSummary[] }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const dest = useDestination();
  const user = useCurrentUser();
  const cart = useStore((s) => s.cart);
  const lines = useResolvedLines(cart, catalog);
  const { setShipTo, placeOrder, upsertAddress } = useStore.getState();

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<Address | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [email, setEmail] = useState("");
  const [speed, setSpeed] = useState<Speed>("standard");
  const [method, setMethod] = useState<"card" | "cod" | null>(null);
  const [card, setCard] = useState<CardDetails>({ number: "", name: "", expiry: "", cvc: "" });
  const [cardErrors, setCardErrors] = useState<ReturnType<typeof validateCard>>({});
  const [placing, setPlacing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!hydrated || done) return <CheckoutSkeleton />;

  if (lines.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ShoppingBag}
          title="There's nothing to check out"
          body="Your cart is empty. Add something and come back, your details will be right here."
          action={
            <Button asChild>
              <Link href="/search">Browse products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const saved = user?.addresses ?? [];
  const defaultAddr = saved.find((a) => a.id === user?.defaultAddressId) ?? saved[0];
  const chosen = address ?? (defaultAddr && !addingNew ? defaultAddr : null);
  const codOk = COD_COUNTRIES.has(dest.code);
  const pay = method ?? (codOk ? "cod" : "card");
  const infos = lines.map((l) => l.product.deliveryInfo);
  const cost = lines.map((l) => ({ price: l.product.price, qty: l.qty }));
  const e = estimate(cost, dest, speed);

  function applyAddress(a: Address) {
    setAddress(a);
    setAddingNew(false);
    if (a.country !== dest.code) {
      setShipTo(a.country);
      toast(`Prices updated for ${getDestination(a.country).name}`, { description: "Shipping, import charges and currency now match your address." });
    }
    if (user && !saved.some((x) => x.id === a.id)) upsertAddress(user.email, a);
    setStep(2);
  }

  function continuePayment() {
    if (pay === "card") {
      const errs = validateCard(card);
      setCardErrors(errs);
      if (Object.keys(errs).length) {
        document.getElementById(`card-${Object.keys(errs)[0]}`)?.focus();
        return;
      }
    }
    setFailure(null);
    setStep(4);
  }

  function place() {
    if (!chosen) return setStep(1);
    if (!user && email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("That email address doesn't look right", { description: "Fix it in the address step, or leave it blank." });
      return setStep(1);
    }
    setPlacing(true);
    setFailure(null);
    // Simulated payment processing.
    setTimeout(() => {
      if (pay === "card" && card.number.replace(/\s/g, "") === TEST_CARDS.declined.replace(/\s/g, "")) {
        setPlacing(false);
        setFailure("Your bank declined this card. Nothing was charged. Try a different card, or choose another way to pay.");
        setStep(3);
        return;
      }
      const w = orderDeliveryWindow(infos, dest, speed);
      const order: Order = {
        id: newOrderId(),
        createdAt: new Date().toISOString(),
        accountEmail: user?.email ?? null,
        contactEmail: user?.email ?? (email || null),
        lines: lines.map((l) => ({ productId: l.productId, name: l.product.name, thumbnail: l.product.thumbnail, price: l.product.price, qty: l.qty, size: l.size })),
        destination: dest.code,
        speed,
        estimate: e,
        address: chosen,
        payment: pay === "card" ? { method: "card", last4: card.number.replace(/\D/g, "").slice(-4) } : { method: "cod" },
        deliveryFrom: w.from.toISOString(),
        deliveryTo: w.to.toISOString(),
      };
      setDone(true);
      placeOrder(order);
      router.push(`/checkout/confirmation/${order.id}`);
    }, 1400);
  }

  return (
    <div className="container-page py-8">
      <CheckoutSteps current={step} />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Mobile: the total is one tap away, never hidden. */}
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4 lg:hidden">
          <AccordionItem value="summary" className="border-b-0">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex flex-1 items-center justify-between pr-3">
                <span className="text-sm font-semibold">Order summary</span>
                <span className="font-heading text-base font-bold tabular">{money(e.total, dest)}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <SummaryBody lines={lines} speed={speed} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4">
          {/* 1. Address */}
          <StepCard n={1} title="Delivery address" icon={MapPin} step={step} onEdit={() => setStep(1)} summary={chosen && <AddressSummary a={chosen} />}>
            {!user && (
              <p className="mb-4 text-sm text-muted-foreground">
                Checking out as a guest.{" "}
                <Link href="/signin?next=/checkout" className="font-semibold text-foreground underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                to use saved addresses.
              </p>
            )}
            {saved.length > 0 && !addingNew ? (
              <div className="space-y-3">
                <RadioGroup value={chosen?.id} onValueChange={(id) => setAddress(saved.find((a) => a.id === id) ?? null)} className="gap-2.5">
                  {saved.map((a) => (
                    <label
                      key={a.id}
                      htmlFor={`sa-${a.id}`}
                      className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors", chosen?.id === a.id ? "border-foreground bg-muted/40" : "hover:border-foreground/30")}
                    >
                      <RadioGroupItem value={a.id} id={`sa-${a.id}`} className="mt-0.5" />
                      <span className="text-sm">
                        <span className="flex items-center gap-2 font-semibold">
                          {a.label}
                          {a.id === user?.defaultAddressId && <Badge variant="secondary">Default</Badge>}
                        </span>
                        <AddressSummary a={a} muted />
                      </span>
                    </label>
                  ))}
                </RadioGroup>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="lg" disabled={!chosen} onClick={() => chosen && applyAddress(chosen)}>
                    Deliver here
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setAddingNew(true)}>
                    <Plus /> New address
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <AddressForm initial={emptyAddress(dest.code, user?.name ?? "")} onSubmit={applyAddress} onCancel={saved.length ? () => setAddingNew(false) : undefined} submitLabel="Deliver here" />
                {!user && (
                  <div className="mt-5 max-w-sm space-y-1.5 border-t pt-5">
                    <Label htmlFor="guest-email">
                      Email for order updates <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input id="guest-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="you@example.com" className="h-11 rounded-xl" />
                  </div>
                )}
              </>
            )}
          </StepCard>

          {/* 2. Delivery */}
          <StepCard
            n={2}
            title="Delivery method"
            icon={Truck}
            step={step}
            onEdit={() => setStep(2)}
            summary={
              <p className="text-sm">
                <span className="font-semibold capitalize">{speed}</span> · arrives {formatWindow(orderDeliveryWindow(infos, dest, speed))}
              </p>
            }
          >
            <RadioGroup value={speed} onValueChange={(v) => setSpeed(v as Speed)} className="gap-2.5 sm:grid-cols-2">
              {(["standard", "express"] as const).map((sp) => {
                const est = estimate(cost, dest, sp);
                return (
                  <label
                    key={sp}
                    htmlFor={`speed-${sp}`}
                    className={cn("flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors", speed === sp ? "border-foreground bg-muted/40" : "hover:border-foreground/30")}
                  >
                    <RadioGroupItem value={sp} id={`speed-${sp}`} className="mt-0.5" />
                    <span className="flex-1 text-sm">
                      <span className="flex items-center justify-between font-semibold">
                        {sp === "standard" ? "Standard" : "Express"}
                        <span className="tabular">{est.shipping ? money(est.shipping, dest) : "Free"}</span>
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">Arrives {formatWindow(orderDeliveryWindow(infos, dest, sp))}</span>
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
            <Button size="lg" className="mt-4" onClick={() => setStep(3)}>
              Continue to payment
            </Button>
          </StepCard>

          {/* 3. Payment */}
          <StepCard
            n={3}
            title="Payment"
            icon={CreditCard}
            step={step}
            onEdit={() => setStep(3)}
            summary={<p className="text-sm">{pay === "cod" ? "Cash on delivery" : `Card ending ${card.number.replace(/\D/g, "").slice(-4)}`}</p>}
          >
            {failure && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle />
                <AlertTitle>Payment didn&apos;t go through</AlertTitle>
                <AlertDescription>{failure}</AlertDescription>
              </Alert>
            )}
            <RadioGroup value={pay} onValueChange={(v) => setMethod(v as "card" | "cod")} className="gap-2.5">
              <PayOption value="card" selected={pay === "card"} icon={CreditCard} title="Credit or debit card" sub="Visa, Mastercard, Amex" />
              {codOk && <PayOption value="cod" selected={pay === "cod"} icon={Banknote} title="Cash on delivery" sub={`Pay ${money(e.total, dest)} to the courier. Popular in ${dest.name}.`} />}
            </RadioGroup>
            {pay === "card" && (
              <div className="mt-4">
                <PaymentForm value={card} onChange={setCard} errors={cardErrors} />
              </div>
            )}
            <Button size="lg" className="mt-5" onClick={continuePayment}>
              Review order
            </Button>
          </StepCard>

          {/* 4. Review */}
          <StepCard n={4} title="Review and place order" icon={ShoppingBag} step={step}>
            <ul className="divide-y">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3 py-3 first:pt-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.product.thumbnail} alt="" className="size-14 rounded-xl bg-[#f3f2ee] object-contain p-1" />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="line-clamp-1 font-semibold">{l.product.name}</span>
                    <span className="text-muted-foreground">
                      Qty {l.qty}
                      {l.size && ` · Size ${l.size}`}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular">{money(l.product.price * l.qty, dest)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-2xl bg-muted/50 p-4">
              <OrderTotals lines={lines} speed={speed} />
            </div>
            <Button size="lg" variant="brand" className="mt-5 w-full sm:w-auto" onClick={place} disabled={placing}>
              {placing ? (
                <>
                  <Loader2 className="animate-spin" /> {pay === "card" ? "Processing payment…" : "Placing order…"}
                </>
              ) : (
                <>
                  <Lock /> Place order · {money(e.total, dest)}
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Same total as your cart, in the same currency. Import charges are collected now, so there&apos;s nothing to pay on the doorstep
              {pay === "cod" ? " beyond this amount" : ""}.
            </p>
          </StepCard>
        </div>

        <aside className="hidden rounded-3xl border bg-card p-6 lg:sticky lg:top-8 lg:block" aria-label="Order summary">
          <h2 className="font-heading text-lg font-bold">Order summary</h2>
          <div className="mt-4">
            <SummaryBody lines={lines} speed={speed} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryBody({ lines, speed }: { lines: ResolvedLine[]; speed: Speed }) {
  const dest = useDestination();
  return (
    <>
      <ul className="mb-4 space-y-3">
        {lines.map((l) => (
          <li key={l.key} className="flex items-center gap-3 text-sm">
            <span className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.product.thumbnail} alt="" className="size-12 rounded-xl bg-[#f3f2ee] object-contain p-1" />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">{l.qty}</span>
            </span>
            <span className="line-clamp-2 min-w-0 flex-1">{l.product.name}</span>
            <span className="tabular">{money(l.product.price * l.qty, dest)}</span>
          </li>
        ))}
      </ul>
      <OrderTotals lines={lines} speed={speed} />
    </>
  );
}

function StepCard({
  n,
  title,
  icon: Icon,
  step,
  onEdit,
  summary,
  children,
}: {
  n: Step;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  step: Step;
  onEdit?: () => void;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  const active = step === n;
  const complete = step > n;
  return (
    <section className={cn("rounded-3xl border bg-card p-5 transition-opacity sm:p-6", !active && !complete && "opacity-60")} aria-labelledby={`step-${n}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`step-${n}`} className="flex items-center gap-2.5 font-heading text-lg font-bold">
          <Icon className={cn("size-5", complete ? "text-brand" : "text-muted-foreground")} />
          {title}
        </h2>
        {complete && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil /> Change
          </Button>
        )}
      </div>
      {complete && summary && <div className="mt-2 pl-7.5">{summary}</div>}
      {active && <div className="mt-5 animate-in fade-in-0 slide-in-from-top-1">{children}</div>}
    </section>
  );
}

function PayOption({ value, selected, icon: Icon, title, sub }: { value: string; selected: boolean; icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <label htmlFor={`pay-${value}`} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors", selected ? "border-foreground bg-muted/40" : "hover:border-foreground/30")}>
      <RadioGroupItem value={value} id={`pay-${value}`} />
      <Icon className="size-5 text-muted-foreground" />
      <span className="text-sm">
        <span className="block font-semibold">{title}</span>
        <span className="text-muted-foreground">{sub}</span>
      </span>
    </label>
  );
}

function AddressSummary({ a, muted }: { a: Address; muted?: boolean }) {
  return (
    <address className={cn("text-sm not-italic", muted && "mt-0.5 block text-muted-foreground")}>
      {!muted && <span className="font-semibold">{a.name} · </span>}
      {a.line1}, {a.city}
      {a.postcode && ` ${a.postcode}`}, {getDestination(a.country).name}
      {!muted && <span className="text-muted-foreground"> · {a.phone}</span>}
    </address>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container-page py-8" role="status" aria-label="Loading checkout">
      <Skeleton className="h-7 w-full max-w-2xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-20 rounded-3xl" />
          <Skeleton className="h-20 rounded-3xl" />
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}
