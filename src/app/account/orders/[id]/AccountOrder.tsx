"use client";

import { ArrowLeft, PackageSearch } from "lucide-react";
import Link from "next/link";
import { OrderDetail } from "@/components/account/OrderDetail";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useStore } from "@/lib/store";

export function AccountOrder({ id }: { id: string }) {
  const user = useCurrentUser()!;
  const order = useStore((s) => s.orders.find((o) => o.id === id && o.accountEmail === user.email));

  if (!order) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="We can't find that order"
        body="It isn't in this account. Check the order number, or look through your order history."
        action={
          <Button asChild>
            <Link href="/account/orders">All orders</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All orders
      </Link>
      <div className="mt-3 mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold">Order {order.id}</h2>
        <p className="text-sm text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</p>
      </div>
      <OrderDetail order={order} />
    </div>
  );
}
