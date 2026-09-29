import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetail } from "./OrderDetail";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  return (
    <Suspense>
      <OrderDetail id={id} />
    </Suspense>
  );
}
