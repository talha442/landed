"use client";

import { Check, Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  name: string;
  qty?: number;
  size?: string;
  /** Return false to cancel (e.g. a size still needs choosing). */
  beforeAdd?: () => boolean;
  className?: string;
  buttonSize?: "default" | "sm" | "lg";
  label?: string;
};

/**
 * Adding shows a short working state, then a tick, then a toast with a way to the
 * cart. Three beats of feedback so nobody wonders whether it worked.
 */
export function AddToCartButton({ productId, name, qty = 1, size, beforeAdd, className, buttonSize = "default", label = "Add to cart" }: Props) {
  const add = useStore((s) => s.addToCart);
  const router = useRouter();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  function click(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (state !== "idle" || (beforeAdd && !beforeAdd())) return;
    setState("adding");
    setTimeout(() => {
      add(productId, qty, size);
      setState("added");
      toast.success(qty > 1 ? `${qty} added to your cart` : "Added to your cart", {
        description: size ? `${name} · Size ${size}` : name,
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
      setTimeout(() => setState("idle"), 1400);
    }, 350);
  }

  return (
    <Button size={buttonSize} onClick={click} className={cn("gap-2", className)} aria-live="polite" disabled={state === "adding"}>
      {state === "adding" ? (
        <>
          <Loader2 className="animate-spin" /> Adding…
        </>
      ) : state === "added" ? (
        <>
          <Check /> Added
        </>
      ) : (
        <>
          <ShoppingBag /> {label}
        </>
      )}
    </Button>
  );
}
