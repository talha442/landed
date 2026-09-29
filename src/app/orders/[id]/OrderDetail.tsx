"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckIcon } from "@/components/icons";
import { getDestination, money } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import { OrderStatus, stageOf } from "../OrderStatus";

export function OrderDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const placed = useSearchParams().get("placed") === "1";
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!hydrated) return <div className="mx-auto max-w-[1000px] px-3 py-6"><div className="card h-80 animate-pulse" /></div>;

  if (!order) {
    return (
      <div className="mx-auto max-w-[1000px] px-3 py-10">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-medium">Order not found</h1>
          <p className="mt-2 text-sm text-muted">Orders are stored in the browser they were placed in.</p>
          <Link href="/orders" className="btn-ghost mt-4">
            Your orders
          </Link>
        </div>
      </div>
    );
  }

  const dest = getDestination(order.destination);
  const e = order.estimate;
  const { cancelOrder, addToCart } = useStore.getState();
  const cancellable = stageOf(order) === 0;

  return (
    <div className="mx-auto max-w-[1000px] space-y-4 px-3 py-6">
      {placed && order.status === "placed" && (
        <div className="card flex items-start gap-3 border-l-4 border-ok p-4" role="status">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ok text-white">
            <CheckIcon className="size-4" />
          </span>
          <div>
            <p className="text-lg font-bold text-ok">Order placed, thank you!</p>
            <p className="text-sm">
              {order.email ? <>A confirmation would go to {order.email}. </> : null}
              You were charged exactly the total you saw in your cart: <span className="font-bold">{money(e.total, dest)}</span>.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-medium">Order details</h1>
        <p className="text-sm text-muted">
          Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Order # {order.id}
        </p>
      </div>

      <div className="card grid gap-6 p-4 sm:grid-cols-3 sm:p-6">
        <div>
          <h2 className="text-sm font-bold">Ship to</h2>
          <address className="mt-1 text-sm not-italic">
            {order.address.name}
            <br />
            {order.address.line1}
            <br />
            {order.address.city} {order.address.postcode}
            <br />
            {dest.name}
          </address>
        </div>
        <div>
          <h2 className="text-sm font-bold">Payment</h2>
          <p className="mt-1 text-sm">{order.payment === "cod" ? "Cash on delivery" : "Test card •••• 4242"}</p>
          <p className="mt-1 text-sm capitalize text-muted">{order.speed} delivery</p>
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Items</dt><dd>{money(e.items, dest)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{e.shipping ? money(e.shipping, dest) : "Free"}</dd></div>
          <div className="flex justify-between"><dt>{dest.dutyLabel}</dt><dd>{money(e.duties, dest)}</dd></div>
          <div className="flex justify-between border-t border-line pt-1 font-bold"><dt>Total</dt><dd>{money(e.total, dest)}</dd></div>
        </dl>
      </div>

      <div className="card p-4 sm:p-6">
        <OrderStatus order={order} detailed />
        <ul className="mt-6 divide-y divide-line">
          {order.lines.map((l) => (
            <li key={`${l.productId}-${l.size ?? ""}`} className="flex gap-4 py-3">
              <Link href={`/p/${l.productId}`} className="shrink-0 rounded bg-[#f7f8f8] p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.thumbnail} alt="" className="size-20 object-contain mix-blend-multiply" />
              </Link>
              <div className="min-w-0 flex-1 text-sm">
                <Link href={`/p/${l.productId}`} className="link line-clamp-2">
                  {l.title}
                </Link>
                <p className="text-muted">
                  Qty {l.qty}
                  {l.size && ` · Size ${l.size}`} · {money(l.price * l.qty, dest)}
                </p>
                <button className="btn-cta mt-2 px-3 py-1" onClick={() => addToCart(l.productId, 1, l.size)}>
                  Buy it again
                </button>
              </div>
            </li>
          ))}
        </ul>
        {cancellable && (
          <div className="mt-4 border-t border-line pt-4">
            {confirmCancel ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span>Cancel this order? This can&apos;t be undone.</span>
                <button className="btn-ghost border-deal px-3 py-1 text-deal" onClick={() => cancelOrder(order.id)}>
                  Yes, cancel order
                </button>
                <button className="link" onClick={() => setConfirmCancel(false)}>
                  Keep it
                </button>
              </div>
            ) : (
              <button className="btn-ghost" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
