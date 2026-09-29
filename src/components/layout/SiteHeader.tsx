"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { SearchBox } from "@/components/search/SearchBox";
import { departments } from "@/lib/catalog-meta";
import type { SearchEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AccountMenu, CartButton, WishlistButton } from "./HeaderActions";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ShipToPicker } from "./ShipToPicker";

/**
 * One row: brand, search, and three icons. Amazon's header carries ~20 links plus a
 * second nav bar; this keeps search as the obvious first move and pushes departments
 * into a single quiet row below.
 */
export function SiteHeader({ index }: { index: SearchEntry[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return <CheckoutHeader />;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center gap-2 md:gap-4">
        <MobileNav />
        <Logo />
        <ShipToPicker className="ml-2 hidden lg:flex" />
        <SearchBox index={index} className="mx-2 hidden max-w-2xl flex-1 md:flex" />
        <div className="ml-auto flex items-center gap-0.5">
          <AccountMenu />
          <WishlistButton />
          <CartButton />
        </div>
      </div>
      <div className="container-page pb-3 md:hidden">
        <SearchBox index={index} />
        <ShipToPicker compact className="-ml-2.5 mt-1.5 py-1 text-xs" />
      </div>
      <DepartmentsBar />
    </header>
  );
}

function DepartmentsBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/search" ? params.get("category") : null;
  return (
    <nav aria-label="Departments" className="hidden border-t md:block">
      <div className="container-page flex h-11 items-center gap-1 overflow-x-auto text-sm [scrollbar-width:none]">
        <Link
          href="/search?sort=discount"
          className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-sale hover:bg-muted"
        >
          Deals
        </Link>
        {departments.map((d) => (
          <Link
            key={d.slug}
            href={`/search?category=${d.slug}`}
            aria-current={current === d.slug ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              current === d.slug && "bg-foreground text-background hover:bg-foreground hover:text-background",
            )}
          >
            {d.name}
          </Link>
        ))}
        <ShipToPicker compact className="ml-auto hidden shrink-0 text-xs md:flex lg:hidden" />
      </div>
    </nav>
  );
}

function CheckoutHeader() {
  return (
    <header className="border-b bg-background">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Lock className="size-4 text-brand" /> Secure checkout
        </p>
        <Link href="/cart" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Back to cart
        </Link>
      </div>
    </header>
  );
}
