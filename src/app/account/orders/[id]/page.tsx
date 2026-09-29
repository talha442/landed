import type { Metadata } from "next";
import { AccountOrder } from "./AccountOrder";

export const metadata: Metadata = { title: "Order details" };

export default async function AccountOrderPage({ params }: PageProps<"/account/orders/[id]">) {
  return <AccountOrder id={(await params).id} />;
}
