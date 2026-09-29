"use client";

import { ChevronRight, Heart, Menu, Package, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { departments } from "@/lib/catalog-meta";
import { useCurrentUser, useHydrated } from "@/lib/store";
import { LogoMark } from "./Logo";
import { ShipToPicker } from "./ShipToPicker";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-[22px]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm gap-0 overflow-y-auto p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-lg">
            <LogoMark className="size-6" /> landed
          </SheetTitle>
          <SheetDescription>{hydrated && user ? `Signed in as ${user.name}` : "Shop by department"}</SheetDescription>
        </SheetHeader>
        <div className="px-3 py-3">
          <ShipToPicker className="w-full justify-start" />
        </div>
        <Separator />
        <nav aria-label="Departments" className="px-3 py-2">
          <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Departments</p>
          <Link href="/search" onClick={close} className="flex items-center justify-between rounded-lg px-2 py-2.5 font-medium hover:bg-muted">
            All products <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link href="/search?sort=discount" onClick={close} className="flex items-center justify-between rounded-lg px-2 py-2.5 font-medium text-sale hover:bg-muted">
            Deals <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          {departments.map((d) => (
            <Link key={d.slug} href={`/search?category=${d.slug}`} onClick={close} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted">
              <span>
                <span className="block font-medium">{d.name}</span>
                <span className="block text-xs text-muted-foreground">{d.blurb}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </nav>
        <Separator />
        <nav aria-label="Your account" className="px-3 py-2 pb-6">
          {hydrated && user ? (
            <>
              <Link href="/account" onClick={close} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
                <User className="size-4" /> Account
              </Link>
              <Link href="/account/orders" onClick={close} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
                <Package className="size-4" /> Orders
              </Link>
            </>
          ) : (
            <Link href="/signin" onClick={close} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
              <User className="size-4" /> Sign in or create account
            </Link>
          )}
          <Link href="/wishlist" onClick={close} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
            <Heart className="size-4" /> Wishlist
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
