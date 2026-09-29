import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["Address", "Delivery", "Payment", "Review", "Confirmation"] as const;

/** 1-based current step; steps before it are complete. */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < current || (n === STEPS.length && current === STEPS.length);
          const active = n === current;
          return (
            <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done ? "bg-brand text-white" : active ? "bg-foreground text-background" : "border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
              </span>
              <span className={cn("hidden text-sm whitespace-nowrap md:block", active ? "font-semibold" : "text-muted-foreground")}>{label}</span>
              {n < STEPS.length && <span className={cn("h-px flex-1", n < current ? "bg-brand" : "bg-border")} aria-hidden />}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm font-semibold md:hidden">
        Step {Math.min(current, STEPS.length)} of {STEPS.length}: {STEPS[Math.min(current, STEPS.length) - 1]}
      </p>
    </nav>
  );
}
