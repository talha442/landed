import type { Metadata } from "next";
import { Suspense } from "react";
import { departments, search, summarize } from "@/lib/catalog";
import { SearchResults } from "./SearchResults";

export async function generateMetadata({ searchParams }: PageProps<"/s">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q ? `Results for "${q}"` : "All products" };
}

export default async function SearchPage({ searchParams }: PageProps<"/s">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const dept = typeof sp.dept === "string" ? sp.dept : "";
  const results = search(q, dept || undefined).map(summarize);

  // Counts per department for the same query, so switching department never dead-ends.
  const deptCounts = q
    ? Object.fromEntries(departments.map((d) => [d.slug, search(q, d.slug).length]))
    : Object.fromEntries(departments.map((d) => [d.slug, search("", d.slug).length]));

  return (
    <Suspense>
      <SearchResults key={`${q}|${dept}`} q={q} dept={dept} results={results} deptCounts={deptCounts} />
    </Suspense>
  );
}
