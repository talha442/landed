"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { Address, Order } from "./orders";
import { demoState } from "./demo";
import type { ProductSummary } from "./types";

export type { Address, Order };

export type CartLine = { key: string; productId: string; qty: number; size?: string };

export type User = {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  addresses: Address[];
  defaultAddressId?: string;
};

type State = {
  shipTo: string | null;
  cart: CartLine[];
  saved: CartLine[];
  wishlist: string[];
  /** Snapshots, newest first, so any page can show them without the catalog. */
  recentlyViewed: ProductSummary[];
  recentSearches: string[];
  users: User[];
  currentEmail: string | null;
  orders: Order[];
  /** Snapshots, so the compare tray works on any page without loading the catalog. */
  compare: ProductSummary[];

  setShipTo: (code: string) => void;
  addToCart: (productId: string, qty?: number, size?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => CartLine | undefined;
  restore: (line: CartLine, index?: number) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  toggleWishlist: (productId: string) => boolean;
  viewed: (p: ProductSummary) => void;
  searched: (q: string) => void;
  clearSearches: () => void;
  register: (u: Omit<User, "addresses" | "createdAt">) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  updateProfile: (email: string, patch: Partial<Pick<User, "name">>) => void;
  upsertAddress: (email: string, a: Address, makeDefault?: boolean) => void;
  deleteAddress: (email: string, id: string) => void;
  placeOrder: (o: Order) => void;
  cancelOrder: (id: string) => void;
  toggleCompare: (p: ProductSummary) => boolean;
  clearCompare: () => void;
  resetDemo: () => void;
};

const lineKey = (productId: string, size?: string) => (size ? `${productId}:${size}` : productId);

export const MAX_QTY = 10;
export const MAX_COMPARE = 4;

const initial = () => ({
  shipTo: null,
  cart: [],
  saved: [],
  wishlist: [],
  recentlyViewed: [],
  recentSearches: [],
  currentEmail: null,
  compare: [],
  ...demoState(),
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),

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

      remove: (key) => {
        const line = get().cart.find((l) => l.key === key);
        set((s) => ({ cart: s.cart.filter((l) => l.key !== key) }));
        return line;
      },

      restore: (line, index) =>
        set((s) => {
          if (s.cart.some((l) => l.key === line.key)) return s;
          const cart = [...s.cart];
          cart.splice(index ?? cart.length, 0, line);
          return { cart };
        }),

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

      /** Returns true when the product is now in the wishlist. */
      toggleWishlist: (productId) => {
        const has = get().wishlist.includes(productId);
        set((s) => ({ wishlist: has ? s.wishlist.filter((id) => id !== productId) : [productId, ...s.wishlist] }));
        return !has;
      },

      viewed: (p) => set((s) => ({ recentlyViewed: [p, ...s.recentlyViewed.filter((x) => x.id !== p.id)].slice(0, 12) })),

      searched: (q) => {
        const clean = q.trim();
        if (!clean) return;
        set((s) => ({ recentSearches: [clean, ...s.recentSearches.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6) }));
      },
      clearSearches: () => set({ recentSearches: [] }),

      register: (u) =>
        set((s) => ({
          users: [...s.users.filter((x) => x.email !== u.email), { ...u, createdAt: new Date().toISOString(), addresses: [] }],
          currentEmail: u.email,
          orders: claimGuestOrders(s.orders, u.email),
        })),

      signIn: (email) => set((s) => ({ currentEmail: email, orders: claimGuestOrders(s.orders, email) })),
      signOut: () => set({ currentEmail: null }),

      updateProfile: (email, patch) => set((s) => ({ users: s.users.map((u) => (u.email === email ? { ...u, ...patch } : u)) })),

      upsertAddress: (email, a, makeDefault) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.email !== email) return u;
            const exists = u.addresses.some((x) => x.id === a.id);
            const addresses = exists ? u.addresses.map((x) => (x.id === a.id ? a : x)) : [...u.addresses, a];
            return { ...u, addresses, defaultAddressId: makeDefault || !u.defaultAddressId ? a.id : u.defaultAddressId };
          }),
        })),

      deleteAddress: (email, id) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.email !== email) return u;
            const addresses = u.addresses.filter((x) => x.id !== id);
            return { ...u, addresses, defaultAddressId: u.defaultAddressId === id ? addresses[0]?.id : u.defaultAddressId };
          }),
        })),

      placeOrder: (o) => set((s) => ({ orders: [o, ...s.orders], cart: [] })),
      cancelOrder: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, cancelledAt: new Date().toISOString() } : o)) })),

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

      resetDemo: () => set(initial()),
    }),
    {
      name: "landed",
      version: 2,
      // v1 was the pre-rebrand shape (numeric product ids); start fresh rather than migrate.
      migrate: () => initial() as unknown as State,
    },
  ),
);

/** Guest orders placed on this device join the account you sign in to. */
function claimGuestOrders(orders: Order[], email: string) {
  return orders.map((o) => (o.accountEmail === null ? { ...o, accountEmail: email } : o));
}

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
