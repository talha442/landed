import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { products, summarize, trending } from "@/lib/catalog";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return <CartView catalog={products.map(summarize)} suggestions={trending(4).map(summarize)} />;
}
