"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { Estimate, Speed } from "./shipping";
import type { ProductSummary } from "./types";

export type CartLine = { key: string; productId: number; qty: number; size?: string };

export type Address = {
  name: string;
  phone: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
};

export type OrderLine = { productId: number; title: string; thumbnail: string; price: number; qty: number; size?: string };

export type Order = {
  id: string;
  createdAt: string;
  email: string | null;
  lines: OrderLine[];
  destination: string;
  speed: Speed;
  estimate: Estimate;
  address: Address;
  payment: "cod" | "card";
  deliveryFrom: string;
  deliveryTo: string;
  status: "placed" | "cancelled";
};

export type User = { email: string; name: string; passwordHash: string; address?: Address };

type State = {
  shipTo: string | null;
  cart: CartLine[];
  saved: CartLine[];
  recentlyViewed: number[];
  users: User[];
  currentEmail: string | null;
  orders: Order[];
  /** Snapshots, so the compare tray works on any page without loading the catalog. */
  compare: ProductSummary[];

  setShipTo: (code: string) => void;
  addToCart: (productId: number, qty?: number, size?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  viewed: (productId: number) => void;
  register: (u: User) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  saveAddress: (email: string, a: Address) => void;
  placeOrder: (o: Order) => void;
  cancelOrder: (id: string) => void;
  toggleCompare: (p: ProductSummary) => boolean;
  clearCompare: () => void;
};

const lineKey = (productId: number, size?: string) => (size ? `${productId}:${size}` : String(productId));

export const MAX_QTY = 10;
export const MAX_COMPARE = 4;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      shipTo: null,
      cart: [],
      saved: [],
      recentlyViewed: [],
      users: [],
      currentEmail: null,
      orders: [],
      compare: [],

      setShipTo: (code) => set({ shipTo: code }),

      addToCart: (productId, qty = 1, size) =>
        set((s) => {
          const key = lineKey(productId, size);
          const existing = s.cart.find((l) => l.key === key);
          const cart = existing
            ? s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
            : [...s.cart, { key, productId, qty: Math.min(MAX_QTY, qty), size }];
          return { cart, saved: s.saved.filter((l) => l.key !== key) };
        }),

      setQty: (key, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
        })),

      remove: (key) => set((s) => ({ cart: s.cart.filter((l) => l.key !== key) })),

      saveForLater: (key) =>
        set((s) => {
          const line = s.cart.find((l) => l.key === key);
          if (!line) return s;
          return { cart: s.cart.filter((l) => l.key !== key), saved: [line, ...s.saved.filter((l) => l.key !== key)] };
        }),

      moveToCart: (key) =>
        set((s) => {
          const line = s.saved.find((l) => l.key === key);
          if (!line) return s;
          return { saved: s.saved.filter((l) => l.key !== key), cart: [...s.cart.filter((l) => l.key !== key), line] };
        }),

      removeSaved: (key) => set((s) => ({ saved: s.saved.filter((l) => l.key !== key) })),

      viewed: (productId) => set((s) => ({ recentlyViewed: [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(0, 12) })),

      register: (u) => set((s) => ({ users: [...s.users.filter((x) => x.email !== u.email), u], currentEmail: u.email })),
      signIn: (email) => set({ currentEmail: email }),
      signOut: () => set({ currentEmail: null }),
      saveAddress: (email, a) => set((s) => ({ users: s.users.map((u) => (u.email === email ? { ...u, address: a } : u)) })),

      placeOrder: (o) => set((s) => ({ orders: [o, ...s.orders], cart: [] })),
      /** Returns false when the tray is already full. */
      toggleCompare: (p) => {
        const list = get().compare;
        if (list.some((x) => x.id === p.id)) {
          set({ compare: list.filter((x) => x.id !== p.id) });
          return true;
        }
        if (list.length >= MAX_COMPARE) return false;
        set({ compare: [...list, p] });
        return true;
      },
      clearCompare: () => set({ compare: [] }),
      cancelOrder: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)) })),
    }),
    { name: "amazon-rebuild", version: 1 },
  ),
);

/** Persisted state only exists in the browser; render placeholders until it's loaded. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

export function useCurrentUser() {
  return useStore((s) => s.users.find((u) => u.email === s.currentEmail) ?? null);
}

export function useCartCount() {
  return useStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
}

export async function hashPassword(pw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
