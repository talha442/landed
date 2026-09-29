"use client";

import Link from "next/link";
import { getDestination, money } from "@/lib/shipping";
import { useCurrentUser, useHydrated } from "@/lib/store";
import { useVisibleOrders } from "./useOrders";
import { OrderStatus } from "./OrderStatus";

export function OrdersList() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const orders = useVisibleOrders();

  if (!hydrated) return <div className="mx-auto max-w-[1000px] px-3 py-6"><div className="card h-60 animate-pulse" /></div>;

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-medium">Your orders</h1>
        {!user && (
          <p className="text-sm text-subtle">
            Showing guest orders on this device.{" "}
            <Link href="/signin?next=/orders" className="link">
              Sign in
            </Link>{" "}
            to see your account&apos;s orders.
          </p>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-lg font-medium">No orders yet</p>
          <Link href="/s" className="btn-cta mt-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((o) => {
            const dest = getDestination(o.destination);
            return (
              <li key={o.id} className="card overflow-hidden border border-line">
                <div className="flex flex-wrap gap-x-8 gap-y-2 bg-[#f0f2f2] px-4 py-3 text-xs text-subtle">
                  <div>
                    <p className="uppercase">Order placed</p>
                    <p className="text-sm text-ink">{new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="uppercase">Total</p>
                    <p className="text-sm text-ink">{money(o.estimate.total, dest)}</p>
                  </div>
                  <div>
                    <p className="uppercase">Ship to</p>
                    <p className="text-sm text-ink">
                      {o.address.name}, {dest.name}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="uppercase">Order # {o.id}</p>
                    <Link href={`/orders/${o.id}`} className="link text-sm">
                      View order details
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <OrderStatus order={o} />
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {o.lines.map((l) => (
                      <li key={`${l.productId}-${l.size ?? ""}`}>
                        <Link href={`/p/${l.productId}`} title={l.title} className="block rounded bg-[#f7f8f8] p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={l.thumbnail} alt={l.title} className="size-20 object-contain mix-blend-multiply" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
