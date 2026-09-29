"use client";

import { useStore } from "@/lib/store";

/** Signed in: that account's orders. Guest: orders on this device not tied to an account. */
export function useVisibleOrders() {
  const orders = useStore((s) => s.orders);
  const users = useStore((s) => s.users);
  const email = useStore((s) => s.currentEmail);
  if (email) return orders.filter((o) => o.email === email);
  const accounts = new Set(users.map((u) => u.email));
  return orders.filter((o) => !o.email || !accounts.has(o.email));
}
