"use client";

import { Command as CommandPrimitive } from "cmdk";
import { ArrowUpRight, Clock, Search, TrendingUp, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { departments } from "@/lib/catalog-meta";
import { useDebounced } from "@/lib/hooks";
import { rank } from "@/lib/search";
import { estimateOne, money } from "@/lib/shipping";
import { useHydrated, useStore } from "@/lib/store";
import type { SearchEntry } from "@/lib/types";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";

const POPULAR = ["iPhone", "Watch", "Perfume", "Laptop", "Sunglasses", "Kitchen"];

/**
 * Header search with suggestions (shadcn Command). Suggestions come from a small
 * in-memory index, debounced, so they appear as fast as you type with no network hop.
 * Each product suggestion shows its delivered price, not just the sticker price.
 */
export function SearchBox({ index, className, autoFocus }: { index: SearchEntry[]; className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQ = pathname === "/search" ? (params.get("q") ?? "") : "";
  const [q, setQ] = useState(urlQ);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useHydrated();
  const recent = useStore((s) => s.recentSearches);
  const { searched, clearSearches } = useStore.getState();
  const dest = useDestination();
  const debounced = useDebounced(q, 120);

  // Show the query you're looking at after back/forward navigation.
  const [lastUrlQ, setLastUrlQ] = useState(urlQ);
  if (urlQ !== lastUrlQ) {
    setLastUrlQ(urlQ);
    setQ(urlQ);
  }

  // cmdk hard-codes aria-expanded="true" on its input. Keep it truthful for screen readers.
  // (React leaves the attribute alone after mount because cmdk's value never changes.)
  useEffect(() => {
    inputRef.current?.setAttribute("aria-expanded", String(open));
  }, [open]);

  // "/" jumps to search from anywhere, like most search-first products.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const productHits = useMemo(() => (debounced.trim() ? rank(index, debounced).slice(0, 5) : []), [index, debounced]);
  const deptHits = useMemo(() => {
    const t = debounced.trim().toLowerCase();
    return t ? departments.filter((d) => d.name.toLowerCase().includes(t) || d.blurb.toLowerCase().includes(t)).slice(0, 2) : [];
  }, [debounced]);

  function go(url: string, term?: string) {
    if (term) searched(term);
    setOpen(false);
    inputRef.current?.blur();
    router.push(url);
  }
  const submit = (term: string) => (term.trim() ? go(`/search?q=${encodeURIComponent(term.trim())}`, term) : go("/search"));

  const hasQuery = q.trim().length > 0;

  return (
    <Command
      shouldFilter={false}
      loop
      label="Search products"
      className={cn("relative h-auto overflow-visible rounded-full! bg-transparent p-0", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          inputRef.current?.blur();
        }
      }}
    >
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-full border border-input bg-card pr-1.5 pl-4 transition-shadow",
          open && "border-ring ring-3 ring-ring/15",
        )}
      >
        <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
        <CommandPrimitive.Input
          ref={inputRef}
          value={q}
          onValueChange={(v) => {
            setQ(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          autoFocus={autoFocus}
          placeholder="Search products, brands and more"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
        <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground lg:block" aria-hidden>
          /
        </kbd>
      </div>

      {/* Always in the DOM (hidden when closed) so the input's aria-controls points at something real. */}
      {(
        <div
          hidden={!open}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-xl shadow-black/5 animate-in fade-in-0 slide-in-from-top-1"
          onMouseDown={(e) => e.preventDefault() /* keep focus in the input while clicking */}
        >
          <CommandList className="max-h-[min(70vh,440px)]">
            {hasQuery && (
              <CommandGroup>
                <CommandItem value={`search:${q}`} onSelect={() => submit(q)} className="py-2">
                  <Search className="text-muted-foreground" />
                  <span>
                    Search for <span className="font-semibold">&ldquo;{q.trim()}&rdquo;</span>
                  </span>
                </CommandItem>
              </CommandGroup>
            )}

            {hasQuery && productHits.length > 0 && (
              <CommandGroup heading="Products">
                {productHits.map((p) => (
                  <CommandItem key={p.id} value={`product:${p.id}`} onSelect={() => go(`/product/${p.id}`, q)} className="gap-3 py-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail} alt="" className="size-10 rounded-md bg-muted object-contain p-0.5" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{p.brand ?? p.subcategory}</span>
                    </span>
                    {hydrated && <span className="shrink-0 text-xs font-semibold text-brand tabular">{money(estimateOne(p.price, dest).total, dest)}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasQuery && deptHits.length > 0 && (
              <CommandGroup heading="Departments">
                {deptHits.map((d) => (
                  <CommandItem key={d.slug} value={`dept:${d.slug}`} onSelect={() => go(`/search?category=${d.slug}`)}>
                    <ArrowUpRight className="text-muted-foreground" />
                    {d.name}
                    <span className="text-xs text-muted-foreground">{d.blurb}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasQuery && debounced === q && productHits.length === 0 && deptHits.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">No quick matches. Press Enter to search everything.</p>
            )}

            {!hasQuery && hydrated && recent.length > 0 && (
              <CommandGroup
                heading={
                  <span className="flex items-center justify-between">
                    Recent searches
                    <button type="button" onClick={clearSearches} className="font-medium text-foreground hover:underline">
                      Clear
                    </button>
                  </span>
                }
              >
                {recent.map((r) => (
                  <CommandItem key={r} value={`recent:${r}`} onSelect={() => submit(r)}>
                    <Clock className="text-muted-foreground" />
                    {r}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!hasQuery && (
              <>
                {hydrated && recent.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Popular right now">
                  <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2">
                    {POPULAR.map((t) => (
                      <CommandItem
                        key={t}
                        value={`popular:${t}`}
                        onSelect={() => submit(t)}
                        className="rounded-full! border px-3 py-1 text-[13px] [&>svg:last-child]:hidden"
                      >
                        <TrendingUp className="size-3.5 text-muted-foreground" />
                        {t}
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </div>
      )}
    </Command>
  );
}
