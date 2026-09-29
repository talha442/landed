"use client";

import { formatWindow } from "@/lib/shipping";
import type { Order } from "@/lib/store";

const STAGES = ["Ordered", "Shipped", "Out for delivery", "Delivered"];

/** Simulated progress: orders move along with the clock between placement and delivery. */
export function stageOf(o: Order, now = Date.now()) {
  if (o.status === "cancelled") return -1;
  const start = new Date(o.createdAt).getTime();
  const end = new Date(o.deliveryTo).getTime();
  const t = (now - start) / Math.max(1, end - start);
  if (t >= 1) return 3;
  if (t >= 0.85) return 2;
  if (t >= 0.25) return 1;
  return 0;
}

export function OrderStatus({ order, detailed = false }: { order: Order; detailed?: boolean }) {
  const stage = stageOf(order);
  const w = { from: new Date(order.deliveryFrom), to: new Date(order.deliveryTo) };

  if (stage === -1) return <p className="text-lg font-bold text-deal">Cancelled</p>;

  return (
    <div>
      <p className="text-lg font-bold">{stage === 3 ? "Delivered" : `Arriving ${formatWindow(w)}`}</p>
      {detailed && (
        <ol className="mt-4 grid grid-cols-4 gap-1 text-xs" aria-label="Delivery progress">
          {STAGES.map((s, i) => (
            <li key={s} aria-current={i === stage ? "step" : undefined}>
              <div className={`h-1.5 rounded-full ${i <= stage ? "bg-ok" : "bg-[#e3e6e6]"}`} />
              <p className={`mt-1.5 ${i <= stage ? "font-bold text-ok" : "text-subtle"}`}>{s}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
