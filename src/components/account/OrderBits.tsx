"use client";

import { Check, ChevronRight, Package, PackageCheck, Truck, Warehouse, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { deliveredOn, orderStatus, STATUSES, statusStep, type Order, type Status } from "@/lib/orders";
import { formatDay, formatWindow, getDestination, money } from "@/lib/shipping";
import { cn } from "@/lib/utils";

const STYLE: Record<Status, string> = {
  Processing: "bg-amber-100 text-amber-900",
  Shipped: "bg-sky-100 text-sky-900",
  "Out for delivery": "bg-violet-100 text-violet-900",
  Delivered: "bg-brand-soft text-brand",
  Cancelled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge className={cn("rounded-full border-0 px-2.5 font-semibold", STYLE[status])}>{status}</Badge>;
}

/** One line that answers "where is it?" in plain words. */
export function deliveryLine(o: Order, status = orderStatus(o)) {
  const w = { from: new Date(o.deliveryFrom), to: new Date(o.deliveryTo) };
  switch (status) {
    case "Cancelled":
      return `Cancelled ${formatDay(new Date(o.cancelledAt!))}. Nothing was charged.`;
    case "Delivered":
      return `Delivered ${formatDay(deliveredOn(o))}`;
    case "Out for delivery":
      return "Out for delivery. Arriving today.";
    default:
      return `Arriving ${formatWindow(w)}`;
  }
}

const ICONS = [Warehouse, Truck, Package, PackageCheck];

export function OrderProgress({ order }: { order: Order }) {
  const status = orderStatus(order);
  const step = statusStep(status);
  if (status === "Cancelled") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-muted p-4 text-sm font-medium">
        <X className="size-4" /> {deliveryLine(order, status)}
      </p>
    );
  }
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Delivery progress">
      {STATUSES.map((s, i) => {
        const Icon = i < step ? Check : ICONS[i];
        return (
          <li key={s} aria-current={i === step ? "step" : undefined} className="text-center">
            <div className="flex items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : i <= step ? "bg-brand" : "bg-border")} />
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  i < step ? "bg-brand text-white" : i === step ? "bg-foreground text-background ring-4 ring-foreground/10" : "border bg-card text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className={cn("h-0.5 flex-1", i === STATUSES.length - 1 ? "bg-transparent" : i < step ? "bg-brand" : "bg-border")} />
            </div>
            <p className={cn("mt-2 text-xs", i === step ? "font-semibold" : "text-muted-foreground")}>{s}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderCard({ order, href }: { order: Order; href: string }) {
  const status = orderStatus(order);
  const dest = getDestination(order.destination);
  const count = order.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <Link href={href} className="group block rounded-3xl border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-black/5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={status} />
            <p className="text-sm font-semibold">{deliveryLine(order, status)}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Order {order.id} · Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {count}{" "}
            {count === 1 ? "item" : "items"} to {order.address.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-heading text-lg font-bold tabular">{money(order.estimate.total, dest)}</p>
          <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
      <ul className="mt-4 flex gap-2">
        {order.lines.slice(0, 5).map((l) => (
          <li key={`${l.productId}-${l.size ?? ""}`} className="rounded-xl bg-[#f3f2ee] p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.thumbnail} alt={l.name} title={l.name} className="size-14 object-contain mix-blend-multiply" />
          </li>
        ))}
      </ul>
    </Link>
  );
}
