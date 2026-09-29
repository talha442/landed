"use client";

import { Heart, LogOut, MapPin, Package, Settings, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCartCount, useCurrentUser, useHydrated, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function CountBadge({ n, className }: { n: number; className?: string }) {
  if (n <= 0) return null;
  return (
    // Keyed by count so it re-mounts and bumps each time the number changes.
    <span
      key={n}
      className={cn(
        "absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] animate-bump items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white tabular",
        className,
      )}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function CartButton() {
  const count = useCartCount();
  const hydrated = useHydrated();
  const n = hydrated ? count : 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/cart" aria-label={`Cart, ${n} ${n === 1 ? "item" : "items"}`}>
            <ShoppingBag className="size-[22px]" />
            <CountBadge n={n} />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Cart</TooltipContent>
    </Tooltip>
  );
}

export function WishlistButton() {
  const count = useStore((s) => s.wishlist.length);
  const hydrated = useHydrated();
  const n = hydrated ? count : 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/wishlist" aria-label={`Wishlist, ${n} saved`}>
            <Heart className="size-[22px]" />
            <CountBadge n={n} className="bg-sale" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Wishlist</TooltipContent>
    </Tooltip>
  );
}

export function AccountMenu() {
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const router = useRouter();
  const signOut = useStore((s) => s.signOut);

  if (!hydrated || !user) {
    return (
      <Button asChild variant="ghost" className="gap-2 px-3">
        <Link href="/signin">
          <User className="size-5" />
          <span className="hidden text-sm font-semibold sm:inline">Sign in</span>
        </Link>
      </Button>
    );
  }

  const initials = user.name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2 sm:pr-3" aria-label={`Account menu for ${user.name}`}>
          <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">{initials}</span>
          <span className="hidden text-sm font-semibold sm:inline">{user.name.split(" ")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/account/orders")}>
          <Package /> Orders
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/wishlist")}>
          <Heart /> Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/account/addresses")}>
          <MapPin /> Addresses
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/account")}>
          <Settings /> Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            signOut();
            toast("You're signed out", { description: "Your cart stays on this device." });
            router.push("/");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
