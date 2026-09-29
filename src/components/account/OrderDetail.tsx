"use client";

import { RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { canCancel, orderStatus, type Order } from "@/lib/orders";
import { getDestination, money } from "@/lib/shipping";
import { useStore } from "@/lib/store";
import { OrderProgress, StatusBadge, deliveryLine } from "./OrderBits";

export function OrderDetail({ order }: { order: Order }) {
  const dest = getDestination(order.destination);
  const e = order.estimate;
  const status = orderStatus(order);
  const router = useRouter();
  const { cancelOrder, addToCart } = useStore.getState();

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={status} />
          <p className="font-heading text-lg font-bold">{deliveryLine(order, status)}</p>
        </div>
        <div className="mt-6">
          <OrderProgress order={order} />
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-5 sm:p-6" aria-labelledby="items-h">
        <div className="flex items-center justify-between">
          <h2 id="items-h" className="font-heading text-lg font-bold">
            Items
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              order.lines.forEach((l) => addToCart(l.productId, l.qty, l.size));
              toast.success("Added to your cart", { description: `${order.lines.length} ${order.lines.length === 1 ? "item" : "items"} from this order`, action: { label: "View cart", onClick: () => router.push("/cart") } });
            }}
          >
            <RotateCcw /> Buy again
          </Button>
        </div>
        <ul className="mt-4 divide-y">
          {order.lines.map((l) => (
            <li key={`${l.productId}-${l.size ?? ""}`} className="flex items-center gap-4 py-3 first:pt-0">
              <Link href={`/product/${l.productId}`} className="shrink-0 rounded-xl bg-[#f3f2ee] p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.thumbnail} alt="" className="size-16 object-contain mix-blend-multiply" />
              </Link>
              <div className="min-w-0 flex-1 text-sm">
                <Link href={`/product/${l.productId}`} className="line-clamp-2 font-semibold hover:underline">
                  {l.name}
                </Link>
                <p className="text-muted-foreground">
                  Qty {l.qty}
                  {l.size && ` · Size ${l.size}`}
                </p>
              </div>
              <p className="text-sm font-semibold tabular">{money(l.price * l.qty, dest)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-card p-5">
          <h3 className="text-sm font-semibold">Delivering to</h3>
          <address className="mt-2 text-sm leading-relaxed text-muted-foreground not-italic">
            {order.address.name}
            <br />
            {order.address.line1}
            <br />
            {order.address.city} {order.address.postcode}
            <br />
            {dest.name}
          </address>
        </div>
        <div className="rounded-3xl border bg-card p-5">
          <h3 className="text-sm font-semibold">Payment & delivery</h3>
          <p className="mt-2 text-sm text-muted-foreground">{order.payment.method === "cod" ? "Cash on delivery" : `Card ending ${order.payment.last4}`}</p>
          <p className="text-sm text-muted-foreground capitalize">{order.speed} delivery</p>
          {order.contactEmail && <p className="mt-2 truncate text-sm text-muted-foreground">Updates to {order.contactEmail}</p>}
        </div>
        <div className="rounded-3xl border bg-card p-5">
          <h3 className="text-sm font-semibold">Total</h3>
          <dl className="mt-2 space-y-1 text-sm tabular">
            <div className="flex justify-between text-muted-foreground">
              <dt>Items</dt>
              <dd>{money(e.items, dest)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Shipping</dt>
              <dd>{e.shipping ? money(e.shipping, dest) : "Free"}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>{dest.dutyLabel}</dt>
              <dd>{money(e.duties, dest)}</dd>
            </div>
            <Separator className="my-1.5" />
            <div className="flex justify-between font-bold">
              <dt>{status === "Cancelled" ? "Refunded" : "Paid"}</dt>
              <dd>{money(e.total, dest)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {canCancel(order) && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <XCircle /> Cancel order
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
              <AlertDialogDescription>
                It hasn&apos;t shipped yet, so you can cancel for free. You&apos;ll get back {money(e.total, dest)}. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep order</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => {
                  cancelOrder(order.id);
                  toast("Order cancelled", { description: `${order.id}. Nothing will be charged.` });
                }}
              >
                Cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
