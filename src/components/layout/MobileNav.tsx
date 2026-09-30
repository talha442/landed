"use client";

import { ChevronRight, Heart, Menu, Package, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { MenuDepartment } from "@/lib/catalog";
import { useCurrentUser, useHydrated } from "@/lib/store";
import { LogoMark } from "./Logo";
import { ShipToPicker } from "./ShipToPicker";

/** The mega menu's mobile form: departments expand in place to show their categories. */
export function MobileNav({ menu }: { menu: MenuDepartment[] }) {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const close = () => setOpen(false);
  const row = "flex min-h-11 items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-[22px]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 overflow-y-auto p-0">
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
          <Link href="/search?sort=discount" onClick={close} className={`${row} justify-between font-semibold text-sale`}>
            Deals <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Accordion type="single" collapsible>
            {menu.map((d) => (
              <AccordionItem key={d.slug} value={d.slug} className="border-b-0">
                <AccordionTrigger className="min-h-11 rounded-lg px-2 py-2.5 hover:bg-muted hover:no-underline">
                  <span>
                    <span className="block font-medium">{d.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{d.blurb}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <ul className="ml-2 border-l pl-2">
                    {d.subcategories.map((s) => (
                      <li key={s.name}>
                        <Link href={`/search?category=${d.slug}&sub=${encodeURIComponent(s.name)}`} onClick={close} className={`${row} justify-between text-sm`}>
                          {s.name} <span className="text-xs text-muted-foreground tabular">{s.count}</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href={`/search?category=${d.slug}`} onClick={close} className={`${row} text-sm font-semibold`}>
                        Shop all {d.name}
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Link href="/search" onClick={close} className={`${row} justify-between font-medium`}>
            All products <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </nav>
        <Separator />
        <nav aria-label="Your account" className="px-3 py-2 pb-6">
          {hydrated && user ? (
            <>
              <Link href="/account" onClick={close} className={row}>
                <User className="size-4" /> Account
              </Link>
              <Link href="/account/orders" onClick={close} className={row}>
                <Package className="size-4" /> Orders
              </Link>
            </>
          ) : (
            <Link href="/signin" onClick={close} className={row}>
              <User className="size-4" /> Sign in or create account
            </Link>
          )}
          <Link href="/wishlist" onClick={close} className={row}>
            <Heart className="size-4" /> Wishlist
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
