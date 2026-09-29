/**
 * The cost model behind "total price everywhere".
 *
 * Shipping is charged per shipment plus per item (how AmazonGlobal prices it), import
 * charges are a share of the goods value, and every amount is shown in the destination's
 * currency. The numbers are estimates from this table, not live customs quotes, and the
 * UI says so.
 */

export type Speed = "standard" | "express";

export type Destination = {
  code: string;
  name: string;
  currency: string;
  /** Units of local currency per USD. */
  rate: number;
  /** Decimal places worth showing. Nobody needs paisa. */
  decimals: number;
  shipping: Record<Speed, { perShipment: number; transitDays: [number, number] }>;
  perItem: number;
  /** Order value (USD) at which standard shipping becomes free. */
  freeShippingOver: number | null;
  dutyRate: number;
  dutyLabel: string;
};

export const destinations: Destination[] = [
  {
    code: "PK",
    name: "Pakistan",
    currency: "PKR",
    rate: 277, // Amazon's own rate at checkout: PKR 28,671 shown as $103.48
    decimals: 0,
    shipping: {
      standard: { perShipment: 39.99, transitDays: [8, 12] },
      express: { perShipment: 64.99, transitDays: [4, 6] },
    },
    perItem: 7.99,
    freeShippingOver: null,
    dutyRate: 0.4,
    dutyLabel: "Import duty & sales tax",
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    rate: 1,
    decimals: 2,
    shipping: {
      standard: { perShipment: 5.99, transitDays: [2, 4] },
      express: { perShipment: 12.99, transitDays: [1, 1] },
    },
    perItem: 0,
    freeShippingOver: 35,
    dutyRate: 0.08,
    dutyLabel: "Sales tax",
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    rate: 0.75,
    decimals: 2,
    shipping: {
      standard: { perShipment: 14.99, transitDays: [4, 7] },
      express: { perShipment: 29.99, transitDays: [2, 3] },
    },
    perItem: 3.99,
    freeShippingOver: null,
    dutyRate: 0.2,
    dutyLabel: "Import VAT",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    rate: 3.6725,
    decimals: 2,
    shipping: {
      standard: { perShipment: 19.99, transitDays: [4, 6] },
      express: { perShipment: 34.99, transitDays: [2, 3] },
    },
    perItem: 4.99,
    freeShippingOver: null,
    dutyRate: 0.1,
    dutyLabel: "Customs duty & VAT",
  },
  {
    code: "IN",
    name: "India",
    currency: "INR",
    rate: 88,
    decimals: 0,
    shipping: {
      standard: { perShipment: 24.99, transitDays: [6, 10] },
      express: { perShipment: 44.99, transitDays: [3, 5] },
    },
    perItem: 5.99,
    freeShippingOver: null,
    dutyRate: 0.38,
    dutyLabel: "Customs duty & IGST",
  },
];

export const DEFAULT_DESTINATION = "US";

export function getDestination(code: string | undefined | null) {
  return destinations.find((d) => d.code === code) ?? destinations.find((d) => d.code === DEFAULT_DESTINATION)!;
}

export type CostLine = { price: number; qty: number };

export type Estimate = {
  items: number;
  shipping: number;
  duties: number;
  total: number;
  itemCount: number;
  freeShipping: boolean;
};

/** All amounts in USD; convert with `money()` at display time. */
export function estimate(lines: CostLine[], dest: Destination, speed: Speed = "standard"): Estimate {
  const items = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  if (itemCount === 0) return { items: 0, shipping: 0, duties: 0, total: 0, itemCount: 0, freeShipping: false };
  const freeShipping = speed === "standard" && dest.freeShippingOver !== null && items >= dest.freeShippingOver;
  const shipping = freeShipping ? 0 : dest.shipping[speed].perShipment + dest.perItem * itemCount;
  const duties = items * dest.dutyRate;
  return { items, shipping, duties, total: items + shipping + duties, itemCount, freeShipping };
}

/** What one unit costs delivered, if it's the only thing in the box. */
export function estimateOne(price: number, dest: Destination) {
  return estimate([{ price, qty: 1 }], dest);
}

/**
 * How much cheaper it is to ship the cart as one box than to order each line on its
 * own. This is the number Amazon's per-listing "PKR 12,426 delivery" hides.
 */
export function bundlingSaving(lines: CostLine[], dest: Destination, speed: Speed = "standard") {
  if (lines.length < 2) return 0;
  const separate = lines.reduce((s, l) => s + estimate([l], dest, speed).total, 0);
  return Math.max(0, separate - estimate(lines, dest, speed).total);
}

export function money(usd: number, dest: Destination) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: dest.currency,
    currencyDisplay: dest.currency === "USD" ? "symbol" : "code",
    minimumFractionDigits: dest.decimals,
    maximumFractionDigits: dest.decimals,
  })
    .format(usd * dest.rate)
    .replace(/^([A-Z]{3})\s*/, "$1 ");
}

// ---------------------------------------------------------------- delivery dates

/** Days before the seller hands it to the carrier, from the catalog's shipping note. */
export function dispatchDays(shippingInformation: string) {
  const s = shippingInformation.toLowerCase();
  if (s.includes("overnight")) return 1;
  if (s.includes("1-2")) return 2;
  if (s.includes("3-5")) return 5;
  if (s.includes("1 week")) return 7;
  if (s.includes("2 weeks")) return 14;
  if (s.includes("1 month")) return 30;
  return 5;
}

export function deliveryWindow(shippingInformation: string, dest: Destination, speed: Speed = "standard", from = new Date()) {
  const d = dispatchDays(shippingInformation);
  const [a, b] = dest.shipping[speed].transitDays;
  return { from: addDays(from, d + a), to: addDays(from, d + b), maxDays: d + b };
}

/** For a whole order: it arrives when the slowest item does. */
export function orderDeliveryWindow(infos: string[], dest: Destination, speed: Speed = "standard", from = new Date()) {
  const slowest = infos.reduce((a, b) => (dispatchDays(b) > dispatchDays(a) ? b : a), infos[0] ?? "");
  return deliveryWindow(slowest, dest, speed, from);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatWindow(w: { from: Date; to: Date }) {
  if (w.from.toDateString() === w.to.toDateString()) return formatDay(w.from);
  const sameMonth = w.from.getMonth() === w.to.getMonth();
  const to = sameMonth ? String(w.to.getDate()) : w.to.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${w.from.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} – ${to}`;
}
