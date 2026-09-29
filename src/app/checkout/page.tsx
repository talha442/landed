import type { Metadata } from "next";
import { products, summarize } from "@/lib/catalog";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <CheckoutView catalog={products.map(summarize)} />;
}
