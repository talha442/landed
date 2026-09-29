"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { departments } from "@/lib/catalog";
import { destinations } from "@/lib/shipping";
import { useCartCount, useCurrentUser, useHydrated, useStore } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";
import { CartIcon, ChevronDown, PinIcon, SearchIcon } from "./icons";

export function Header() {
  const pathname = usePathname();
  // Checkout gets a quiet header, like Amazon's: no search to wander off into.
  if (pathname.startsWith("/checkout")) return <CheckoutHeader />;

  return (
    <header className="z-40 md:sticky md:top-0">
      <div className="bg-nav text-white">
        {/* Mobile: logo · account · cart / search / deliver-to. Desktop: one row, like Amazon. */}
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 md:flex-nowrap">
          <Logo />
          <ShipToPicker />
          <SearchBarKeyed />
          <AccountLink />
          <Link href="/orders" className="order-3 hidden rounded px-2 py-1 leading-tight outline-white hover:outline sm:block md:order-none">
            <span className="block text-xs text-[#ccc]">Returns</span>
            <span className="text-sm font-bold">& Orders</span>
          </Link>
          <CartLink />
        </div>
      </div>
      <nav className="bg-nav-2 text-sm text-white" aria-label="Departments">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-3 py-1 [scrollbar-width:none]">
          <Link href="/s" className="shrink-0 rounded px-2 py-1 font-bold outline-white hover:outline">
            All
          </Link>
          <Link href="/s?sort=discount" className="shrink-0 rounded px-2 py-1 outline-white hover:outline">
            Today&apos;s Deals
          </Link>
          {departments.map((d) => (
            <Link key={d.slug} href={`/s?dept=${d.slug}`} className="shrink-0 rounded px-2 py-1 outline-white hover:outline">
              {d.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

function Logo() {
  return (
    <Link href="/" className="order-1 flex shrink-0 items-end gap-1 rounded px-1 pt-1 pb-1.5 outline-white hover:outline md:order-none" aria-label="Amazon rebuilt, home">
      <span className="text-[26px] leading-none font-extrabold tracking-tight">amazon</span>
      <span className="mb-0.5 rounded bg-white/15 px-1 py-px text-[10px] font-medium tracking-wide text-[#febd69] uppercase">rebuilt</span>
    </Link>
  );
}

function CheckoutHeader() {
  return (
    <header className="bg-nav text-white">
      <div className="mx-auto flex max-w-[1150px] items-center justify-between px-4 py-3">
        <Logo />
        <span className="text-lg font-medium sm:text-2xl">Secure checkout</span>
        <Link href="/cart" className="flex items-end gap-1 text-sm font-bold">
          <CartIcon className="size-7" />
          <span className="hidden sm:inline">Cart</span>
        </Link>
      </div>
    </header>
  );
}

function ShipToPicker() {
  const dest = useDestination();
  const setShipTo = useStore((s) => s.setShipTo);
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative order-6 -mx-3 -mb-2 w-[calc(100%+1.5rem)] bg-nav-2 px-1 md:order-none md:m-0 md:w-auto md:bg-transparent md:p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded px-2 py-1.5 text-left leading-tight outline-white hover:outline md:items-end md:py-1"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <PinIcon className="size-4 shrink-0 md:mb-0.5" />
        <span className="flex items-baseline gap-1 md:block">
          <span className="block text-xs text-[#ccc]">Deliver to</span>
          <span className="block min-w-20 text-sm font-bold">{hydrated ? dest.name : "…"}</span>
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg bg-white p-4 text-ink shadow-xl">
          <p className="font-bold">Where should we deliver?</p>
          <p className="mt-1 text-xs text-muted">
            Every price you see becomes the total delivered cost for this country, in its currency: item, shipping and import charges.
          </p>
          <ul className="mt-3 space-y-1" role="listbox" aria-label="Destination country">
            {destinations.map((d) => (
              <li key={d.code}>
                <button
                  role="option"
                  aria-selected={d.code === dest.code}
                  onClick={() => {
                    setShipTo(d.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[#f0f2f2] ${
                    d.code === dest.code ? "bg-[#edfdff] font-semibold ring-1 ring-link" : ""
                  }`}
                >
                  <span>{d.name}</span>
                  <span className="text-xs text-muted">{d.currency}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Remount the box whenever the search in the URL changes (back/forward, department
// links) so it always shows the query on screen.
function SearchBarKeyed() {
  const params = useSearchParams();
  const onSearch = usePathname() === "/s";
  const q = onSearch ? (params.get("q") ?? "") : "";
  const dept = onSearch ? (params.get("dept") ?? "") : "";
  return <SearchBar key={`${q}|${dept}`} initialQ={q} initialDept={dept} className="order-5 w-full md:order-none md:flex-1" />;
}

function SearchBar({ initialQ, initialDept, className = "" }: { initialQ: string; initialDept: string; className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [dept, setDept] = useState(initialDept);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (dept) sp.set("dept", dept);
    router.push(`/s${sp.size ? `?${sp}` : ""}`);
  }

  return (
    <form onSubmit={submit} role="search" className={`flex h-10 overflow-hidden rounded-md focus-within:ring-3 focus-within:ring-buy ${className}`}>
      <label className="sr-only" htmlFor="search-dept">
        Department
      </label>
      <select
        id="search-dept"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
        className="w-auto max-w-16 shrink-0 cursor-pointer sm:max-w-28 border-r border-line bg-[#e6e6e6] px-2 text-xs text-ink outline-none hover:bg-[#d4d4d4]"
      >
        <option value="">All</option>
        {departments.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.name}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="search-q">
        Search
      </label>
      <input
        id="search-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands and categories"
        className="min-w-0 flex-1 bg-white px-3 text-[15px] text-ink outline-none"
        autoComplete="off"
      />
      <button type="submit" className="bg-[#febd69] px-3 text-ink hover:bg-[#f3a847]" aria-label="Search">
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
}

function AccountLink() {
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const signOut = useStore((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));

  if (!hydrated || !user) {
    return (
      <Link href="/signin" className="order-2 ml-auto rounded px-2 py-1 leading-tight outline-white hover:outline md:order-none md:ml-0">
        <span className="block text-xs text-[#ccc]">Hello, sign in</span>
        <span className="text-sm font-bold">Account</span>
      </Link>
    );
  }
  return (
    <div ref={ref} className="relative order-2 ml-auto md:order-none md:ml-0">
      <button onClick={() => setOpen((o) => !o)} className="rounded px-2 py-1 text-left leading-tight outline-white hover:outline" aria-expanded={open}>
        <span className="block text-xs text-[#ccc]">Hello, {user.name.split(" ")[0]}</span>
        <span className="flex items-center gap-1 text-sm font-bold">
          Account <ChevronDown />
        </span>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg bg-white p-2 text-sm text-ink shadow-xl">
          <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
          <Link href="/orders" onClick={() => setOpen(false)} className="block rounded px-3 py-2 hover:bg-[#f0f2f2]">
            Your orders
          </Link>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="block w-full rounded px-3 py-2 text-left hover:bg-[#f0f2f2]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function CartLink() {
  const count = useCartCount();
  const hydrated = useHydrated();
  return (
    <Link href="/cart" className="relative order-4 flex items-end rounded px-2 py-1 outline-white hover:outline md:order-none" aria-label={`Cart, ${hydrated ? count : 0} items`}>
      <span className="relative">
        <CartIcon className="size-9" />
        <span className="absolute -top-1 left-1/2 min-w-5 -translate-x-1/3 text-center text-base leading-none font-bold text-[#f08804]">
          {hydrated ? count : 0}
        </span>
      </span>
      <span className="hidden pb-1 text-sm font-bold sm:inline">Cart</span>
    </Link>
  );
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [ref, onOutside]);
}
