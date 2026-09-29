import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Every empty state says what happened and what to do next. */
export function EmptyState({ icon: Icon, title, body, action, className }: { icon: LucideIcon; title: string; body: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-16 text-center", className)}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </span>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
