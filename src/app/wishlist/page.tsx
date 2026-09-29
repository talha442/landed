import type { Metadata } from "next";
import { WishlistView } from "./WishlistView";
import { products, summarize, trending } from "@/lib/catalog";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <WishlistView catalog={products.map(summarize)} suggestions={trending(4).map(summarize)} />;
}
