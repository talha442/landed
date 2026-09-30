"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHydrated, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WishlistToggle({ productId, name, variant = "icon", className }: { productId: string; name: string; variant?: "icon" | "button"; className?: string }) {
  const hydrated = useHydrated();
  const saved = useStore((s) => s.wishlist.includes(productId));
  const toggle = useStore((s) => s.toggleWishlist);
  const router = useRouter();
  const [burst, setBurst] = useState(0);
  const on = hydrated && saved;

  function click(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(productId);
    if (added) setBurst((b) => b + 1);
    toast(added ? "Saved to your wishlist" : "Removed from your wishlist", {
      description: name,
      action: added ? { label: "View", onClick: () => router.push("/wishlist") } : { label: "Undo", onClick: () => toggle(productId) },
    });
  }

  const heart = <Heart key={burst} className={cn("size-[18px] transition-colors", on && "animate-pop fill-sale text-sale")} />;

  if (variant === "button") {
    return (
      <Button variant="outline" size="lg" onClick={click} aria-pressed={on} className={cn("gap-2", className)}>
        {heart}
        {on ? "Saved" : "Save"}
      </Button>
    );
  }
  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      {heart}
    </button>
  );
}
