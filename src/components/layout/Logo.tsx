import Link from "next/link";
import { cn } from "@/lib/utils";

/** The mark: an arrow landing on a line. The price lands with the parcel. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <path d="M16 7.5v11.5m0 0-4.5-4.5M16 19l4.5-4.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9.5 24h13" stroke="var(--brand-soft)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2 rounded-lg focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none", className)} aria-label="Landed home">
      <LogoMark />
      <span className="font-heading text-[22px] leading-none font-extrabold tracking-[-0.04em]">landed</span>
    </Link>
  );
}
