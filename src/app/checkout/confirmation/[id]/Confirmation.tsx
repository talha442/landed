"use client";

import { CheckCircle2, PackageSearch } from "lucide-react";
import Link from "next/link";
import { OrderDetail } from "@/components/account/OrderDetail";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDestination, money } from "@/lib/shipping";
import { useCurrentUser, useHydrated, useStore } from "@/lib/store";

export function Confirmation({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const user = useCurrentUser();

  if (!hydrated) {
    return (
      <div className="container-page py-8">
        <Skeleton className="h-7 w-full max-w-2xl" />
        <Skeleton className="mt-8 h-40 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-12">
        <EmptyState
          headingLevel={1}
          icon={PackageSearch}
          title="We can't find that order"
          body="Orders are stored in the browser they were placed in. If you placed it on another device, sign in there to see it."
          action={
            <Button asChild>
              <Link href="/account/orders">Your orders</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const dest = getDestination(order.destination);

  return (
    <div className="container-page py-8">
      <CheckoutSteps current={5} />
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-14 animate-in text-brand zoom-in-50" strokeWidth={1.5} />
          <h1 className="mt-4 text-3xl font-extrabold">Thank you, your order is in</h1>
          <p className="mt-2 text-muted-foreground">
            Order <span className="font-semibold text-foreground">{order.id}</span>. You were charged exactly what your cart said:{" "}
            <span className="font-semibold text-foreground">{money(order.estimate.total, dest)}</span>.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {user ? (
              <Button asChild>
                <Link href={`/account/orders/${order.id}`}>Track this order</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/signup?next=/account/orders/${order.id}`}>Create an account to track it</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/search">Keep shopping</Link>
            </Button>
          </div>
          {!user && <p className="mt-3 text-xs text-muted-foreground">Guest orders on this device join your account as soon as you sign in.</p>}
        </div>
        <div className="mt-10">
          <OrderDetail order={order} />
        </div>
      </div>
    </div>
  );
}
