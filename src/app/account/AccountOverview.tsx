"use client";

import { ArrowRight, Heart, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { OrderCard } from "@/components/account/OrderBits";
import { Button } from "@/components/ui/button";
import { orderStatus } from "@/lib/orders";
import { getDestination } from "@/lib/shipping";
import { useCurrentUser, useStore } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";

export function AccountOverview() {
  const user = useCurrentUser()!;
  const orders = useStore((s) => s.orders).filter((o) => o.accountEmail === user.email);
  const wishlist = useStore((s) => s.wishlist.length);
  const dest = useDestination();
  const active = orders.filter((o) => !["Delivered", "Cancelled"].includes(orderStatus(o)));
  const defaultAddr = user.addresses.find((a) => a.id === user.defaultAddressId);

  const stats = [
    { icon: Package, label: "Orders on the way", value: active.length, href: "/account/orders" },
    { icon: Heart, label: "Saved in wishlist", value: wishlist, href: "/wishlist" },
    { icon: MapPin, label: "Saved addresses", value: user.addresses.length, href: "/account/addresses" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-foreground font-heading text-lg font-bold text-background">
            {user.name
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-bold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/account/settings">Edit profile</Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          <p className="rounded-xl bg-muted/60 px-3.5 py-2.5">
            <span className="block text-xs text-muted-foreground">Prices shown for</span>
            <span className="font-semibold">
              {dest.name} ({dest.currency})
            </span>
          </p>
          <p className="rounded-xl bg-muted/60 px-3.5 py-2.5">
            <span className="block text-xs text-muted-foreground">Default address</span>
            <span className="font-semibold">{defaultAddr ? `${defaultAddr.city}, ${getDestination(defaultAddr.country).name}` : "None yet"}</span>
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="group rounded-3xl border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-black/5">
            <Icon className="size-5 text-muted-foreground" />
            <p className="mt-3 font-heading text-3xl font-extrabold tabular">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-sm font-semibold hover:underline">
            All orders <ArrowRight className="size-4" />
          </Link>
        </div>
        {orders.length ? (
          <div className="space-y-3">
            {orders.slice(0, 2).map((o) => (
              <OrderCard key={o.id} order={o} href={`/account/orders/${o.id}`} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            No orders yet.{" "}
            <Link href="/search" className="font-semibold text-foreground hover:underline">
              Start shopping
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
