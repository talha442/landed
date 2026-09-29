"use client";

import { useStore } from "./store";
import { destinations, getDestination } from "./shipping";

function geoCookie() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)geo=([A-Z]{2})/);
  return m && destinations.some((d) => d.code === m[1]) ? m[1] : null;
}

/** Ship-to country: the visitor's choice, else their detected country, else the US. */
export function useDestination() {
  const shipTo = useStore((s) => s.shipTo);
  return getDestination(shipTo ?? geoCookie());
}
