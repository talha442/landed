"use client";

import { Heart, LayoutGrid, MapPin, Package, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { session, useCurrentUser, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

/** Protected area: sends signed-out visitors to sign in, then straight back here. */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user && !session.signedOut) router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, router, pathname]);

  // Once we've left the account area, the next signed-out visit should redirect again.
  useEffect(() => () => session.clearSignOut(), []);

  if (!hydrated || !user) {
    return (
      <div className="container-page py-8" role="status" aria-label="Loading your account">
        <Skeleton className="h-9 w-56" />
        <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
          <Skeleton className="hidden h-60 rounded-2xl md:block" />
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const active = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="container-page py-8">
      <p className="text-sm text-muted-foreground">Your account</p>
      <h1 className="text-3xl font-extrabold">Hi, {user.name.split(" ")[0]}</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
          <ul className="flex gap-1.5 md:sticky md:top-32 md:flex-col">
            {NAV.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active(href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors md:rounded-xl",
                    active(href) ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
