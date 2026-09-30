"use client";

import { ArrowRight, Percent, Star } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { MenuDepartment } from "@/lib/catalog";
import { estimateOne, money } from "@/lib/shipping";
import { useHydrated } from "@/lib/store";
import { useDestination } from "@/lib/useDestination";
import { cn } from "@/lib/utils";
import { ShipToPicker } from "../layout/ShipToPicker";

// Panel links use the bare Radix Link: shadcn's NavigationMenuLink adds flex/padding/hover
// styles (and its content wrapper strips focus rings), which broke the card layouts.
const MenuLink = NavigationMenuPrimitive.Link;
const focusRing = "focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none";

const subHref = (dept: string, sub: string) => `/search?category=${dept}&sub=${encodeURIComponent(sub)}`;

/**
 * Desktop mega menu (Radix NavigationMenu via shadcn). Keyboard: Tab/arrow keys move
 * between departments, Enter/Space/↓ opens a panel, Tab moves into it, Esc closes and
 * returns focus to the trigger. Opens on hover too, with Radix's intent delay.
 *
 * Each panel answers "what's in here?" (types, with counts), "what's good?" (top picks
 * with delivered prices) and "what's on sale?". Amazon's equivalent is a 40-item
 * hamburger drawer.
 */
export function MegaMenu({ menu }: { menu: MenuDepartment[] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/search" ? params.get("category") : null;
  const [open, setOpen] = useState("");

  return (
    <nav aria-label="Departments" className="relative hidden border-t md:block">
      <div className="container-page flex h-12 items-center gap-2">
        <NavigationMenu value={open} onValueChange={setOpen} viewport={false} className="static max-w-none flex-none justify-start" delayDuration={120}>
          <NavigationMenuList className="static justify-start gap-0.5">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/search?sort=discount" className="rounded-full px-3 py-1.5 text-sm font-semibold text-sale hover:bg-muted focus:bg-muted">
                  Deals
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {menu.map((d) => (
              <NavigationMenuItem key={d.slug} className="static">
                <NavigationMenuTrigger
                  className={cn(
                    "h-8 rounded-full bg-transparent px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted data-[state=open]:bg-muted data-[state=open]:text-foreground",
                    current === d.slug && "text-foreground",
                  )}
                  aria-current={current === d.slug ? "page" : undefined}
                >
                  {d.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="!top-0 !left-0 !mt-0 !w-full !rounded-none !bg-transparent !p-0 !shadow-none !ring-0 md:!w-full">
                  <Panel d={d} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
          {/* Full-width viewport under the bar: panels span the page, not just the trigger row. */}
          <div className="absolute inset-x-0 top-full z-50">
            <NavigationMenuPrimitive.Viewport className="relative h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden border-y bg-popover shadow-2xl shadow-black/10 transition-[height] duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          </div>
        </NavigationMenu>
        <ShipToPicker compact className="ml-auto hidden shrink-0 text-xs md:flex lg:hidden" />
      </div>
      {/* Dim the page under an open panel so it reads as a layer, not part of the page.
          Absolute, not fixed: the header's backdrop-blur makes it the containing block for fixed children. */}
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-x-0 top-full z-40 h-dvh bg-foreground/20 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
      />
    </nav>
  );
}

function Panel({ d }: { d: MenuDepartment }) {
  const dest = useDestination();
  const hydrated = useHydrated();
  return (
    <div className="container-page grid gap-8 py-7 lg:grid-cols-[1fr_2fr_1fr]">
      <div>
        <p className="font-heading text-lg font-bold">{d.name}</p>
        <p className="text-sm text-muted-foreground">{d.blurb}</p>
        <ul className="mt-4 space-y-0.5" aria-label={`${d.name} categories`}>
          {d.subcategories.map((s) => (
            <li key={s.name}>
              <MenuLink asChild>
                <Link href={subHref(d.slug, s.name)} className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-muted ${focusRing}`}>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground tabular">{s.count}</span>
                </Link>
              </MenuLink>
            </li>
          ))}
        </ul>
        <MenuLink asChild>
          <Link href={`/search?category=${d.slug}`} className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold underline-offset-4 hover:underline ${focusRing}`}>
            Shop all {d.count} in {d.name} <ArrowRight className="size-4" />
          </Link>
        </MenuLink>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm font-semibold">Top rated</p>
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {d.topPicks.map((p) => (
            <li key={p.id}>
              <MenuLink asChild>
                <Link href={`/product/${p.id}`} className={`group block rounded-2xl border bg-card p-3 transition-shadow hover:shadow-lg hover:shadow-black/5 ${focusRing}`}>
                  <span className="block overflow-hidden rounded-xl bg-[#f3f2ee]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail} alt="" loading="lazy" className="aspect-square w-full object-contain p-3 mix-blend-multiply transition-transform group-hover:scale-105" />
                  </span>
                  <span className="mt-2.5 block truncate text-xs text-muted-foreground">{p.brand ?? d.name}</span>
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="mt-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-star text-star" aria-hidden />
                      <span className="sr-only">Rated</span> {p.rating.toFixed(1)}
                    </span>
                    {hydrated && <span className="font-semibold text-brand tabular">{money(estimateOne(p.price, dest).total, dest)}</span>}
                  </span>
                </Link>
              </MenuLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        {d.deals > 0 && (
          <MenuLink asChild>
            <Link
              href={`/search?category=${d.slug}&sort=discount`}
              className={`flex min-h-40 flex-col justify-between rounded-2xl bg-foreground p-5 text-background transition-opacity hover:opacity-90 ${focusRing}`}
            >
              <Percent className="size-5" aria-hidden />
              <span>
                <span className="block font-heading text-2xl font-extrabold">Up to {d.maxDiscount}% off</span>
                <span className="mt-1 block text-sm text-background/75">
                  {d.deals} {d.name.toLowerCase()} deals, delivered prices included
                </span>
              </span>
            </Link>
          </MenuLink>
        )}
        <MenuLink asChild>
          <Link href={`/search?category=${d.slug}&sort=fastest`} className={`block rounded-2xl border bg-brand-soft p-4 text-sm transition-colors hover:border-brand/40 ${focusRing}`}>
            <span className="block font-semibold text-brand">Fastest to arrive</span>
            <span className="text-muted-foreground">Sorted by delivery date to {hydrated ? dest.name : "you"}</span>
          </Link>
        </MenuLink>
      </div>
    </div>
  );
}
