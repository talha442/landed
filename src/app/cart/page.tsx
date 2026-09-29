import type { Metadata } from "next";
import { products, summarize } from "@/lib/catalog";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return <CartView catalog={products.map(summarize)} />;
}
