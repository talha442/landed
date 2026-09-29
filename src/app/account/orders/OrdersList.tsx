"use client";

import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { OrderCard } from "@/components/account/OrderBits";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderStatus } from "@/lib/orders";
import { useCurrentUser, useStore } from "@/lib/store";

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function OrdersList() {
  const user = useCurrentUser()!;
  const all = useStore((s) => s.orders).filter((o) => o.accountEmail === user.email);
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");

  const inTab = all.filter((o) => {
    const s = orderStatus(o);
    if (tab === "active") return s !== "Delivered" && s !== "Cancelled";
    if (tab === "delivered") return s === "Delivered";
    if (tab === "cancelled") return s === "Cancelled";
    return true;
  });

  if (all.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No orders yet"
        body="When you place an order it shows up here, with where it is and when it'll arrive."
        action={
          <Button asChild>
            <Link href="/search">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Orders</h2>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="h-10 rounded-full p-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="rounded-full px-3">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-5 space-y-3">
        {inTab.length ? (
          inTab.map((o) => <OrderCard key={o.id} order={o} href={`/account/orders/${o.id}`} />)
        ) : (
          <p className="rounded-3xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">No orders in this list.</p>
        )}
      </div>
    </div>
  );
}
