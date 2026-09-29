import type { Estimate, Speed } from "./shipping";

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
};

export type OrderLine = { productId: string; name: string; thumbnail: string; price: number; qty: number; size?: string };

export type Order = {
  id: string;
  createdAt: string;
  /** Account that owns it. Null for guest orders, which are claimed when you sign in. */
  accountEmail: string | null;
  contactEmail: string | null;
  lines: OrderLine[];
  destination: string;
  speed: Speed;
  estimate: Estimate;
  address: Address;
  payment: { method: "card"; last4: string } | { method: "cod" };
  deliveryFrom: string;
  deliveryTo: string;
  cancelledAt?: string;
};

export const STATUSES = ["Processing", "Shipped", "Out for delivery", "Delivered"] as const;
export type Status = (typeof STATUSES)[number] | "Cancelled";

const DAY = 86_400_000;

/**
 * Orders move through their states with the clock: a day processing, shipped until the
 * day before it lands, out for delivery on the last day, then delivered on the first
 * day of the promised window.
 */
export function orderStatus(o: Order, now = Date.now()): Status {
  if (o.cancelledAt) return "Cancelled";
  const created = new Date(o.createdAt).getTime();
  const lands = new Date(o.deliveryFrom).getTime() + DAY;
  if (now < created + DAY) return "Processing";
  if (now < lands - DAY) return "Shipped";
  if (now < lands) return "Out for delivery";
  return "Delivered";
}

export function statusStep(s: Status) {
  return s === "Cancelled" ? -1 : STATUSES.indexOf(s);
}

/** Only orders that haven't left the warehouse can be cancelled. */
export function canCancel(o: Order) {
  return orderStatus(o) === "Processing";
}

export function deliveredOn(o: Order) {
  return new Date(new Date(o.deliveryFrom).getTime() + DAY);
}

export function newOrderId() {
  const r = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
  return `LD-${r(4)}-${r(4)}`;
}
