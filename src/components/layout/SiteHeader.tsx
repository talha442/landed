"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { SearchBox } from "@/components/search/SearchBox";
import { MegaMenu } from "@/components/navigation/MegaMenu";
import type { MenuDepartment } from "@/lib/catalog";
import type { SearchEntry } from "@/lib/types";
import { AccountMenu, CartButton, WishlistButton } from "./HeaderActions";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { ShipToPicker } from "./ShipToPicker";

/**
 * One row: brand, search, and three icons. Amazon's header carries ~20 links plus a
 * second nav bar; this keeps search as the obvious first move and pushes departments
 * into a single quiet row below.
 */
export function SiteHeader({ index, menu }: { index: SearchEntry[]; menu: MenuDepartment[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return <CheckoutHeader />;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="container-page flex h-16 items-center gap-2 md:gap-4">
        <MobileNav menu={menu} />
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
      <MegaMenu menu={menu} />
    </header>
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
