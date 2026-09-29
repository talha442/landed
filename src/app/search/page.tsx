import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search/SearchView";
import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { products, summarize } from "@/lib/catalog";
import { rank } from "@/lib/search";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q.trim() ? `“${q.trim()}”` : "All products" };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 120) : "";
  // Text matching happens here, on the full catalog (descriptions included).
  // Everything else (filters, sort, pages) runs in the browser, so it's instant.
  const results = rank(products, q).map(summarize);

  return (
    <Suspense fallback={<ProductGridSkeleton count={12} className="container-page mt-8" />}>
      <SearchView key={q} q={q} results={results} />
    </Suspense>
  );
}
