import type { Address, Order } from "./orders";
import { estimate, getDestination } from "./shipping";

/**
 * A ready-made account so a reviewer can see every order state without placing
 * four orders and waiting a week. Dates are relative to the first visit.
 */
export const DEMO_EMAIL = "demo@landed.shop";
export const DEMO_PASSWORD = "demo1234";
const DEMO_HASH = "0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d";

const DAY = 86_400_000;

const home: Address = {
  id: "addr-home",
  label: "Home",
  name: "Sam Rivera",
  phone: "+1 415 555 0142",
  line1: "742 Valencia Street, Apt 3",
  city: "San Francisco, CA",
  postcode: "94110",
  country: "US",
};

const office: Address = {
  id: "addr-work",
  label: "Work",
  name: "Sam Rivera",
  phone: "+1 415 555 0142",
  line1: "1 Market Street, Floor 12",
  city: "San Francisco, CA",
  postcode: "94105",
  country: "US",
};

type SeedLine = { productId: string; name: string; thumbnail: string; price: number; qty: number; size?: string };

function order(id: string, daysAgo: number, deliverFromInDays: number, lines: SeedLine[], extra: Partial<Order> = {}): Order {
  const now = Date.now();
  const dest = getDestination("US");
  return {
    id,
    createdAt: new Date(now - daysAgo * DAY).toISOString(),
    accountEmail: DEMO_EMAIL,
    contactEmail: DEMO_EMAIL,
    lines,
    destination: "US",
    speed: "standard",
    estimate: estimate(lines, dest),
    address: home,
    payment: { method: "card", last4: "4242" },
    deliveryFrom: new Date(now + deliverFromInDays * DAY).toISOString(),
    deliveryTo: new Date(now + (deliverFromInDays + 2) * DAY).toISOString(),
    ...extra,
  };
}

export function demoState() {
  const orders: Order[] = [
    // Lands tomorrow: out for delivery today.
    order("LD-4821-0935", 4, -0.5, [
      { productId: "apple-airpods-max-silver", name: "Apple AirPods Max Silver", thumbnail: "/img/p/101/thumb.webp", price: 549.99, qty: 1 },
    ]),
    // Left the warehouse, a few days out.
    order("LD-3307-1184", 2, 3, [
      { productId: "blue-and-black-check-shirt", name: "Blue & Black Check Shirt", thumbnail: "/img/p/83/thumb.webp", price: 29.99, qty: 2, size: "M" },
      { productId: "calvin-klein-ck-one", name: "Calvin Klein CK One", thumbnail: "/img/p/6/thumb.webp", price: 49.99, qty: 1 },
    ]),
    // Delivered last month.
    order("LD-1954-7720", 26, -22, [
      { productId: "apple-macbook-pro-14-inch-space-grey", name: "Apple MacBook Pro 14 Inch Space Grey", thumbnail: "/img/p/78/thumb.webp", price: 1999.99, qty: 1 },
    ], { address: office }),
  ];
  return {
    users: [
      {
        email: DEMO_EMAIL,
        name: "Sam Rivera",
        passwordHash: DEMO_HASH,
        createdAt: new Date(Date.now() - 90 * DAY).toISOString(),
        addresses: [home, office],
        defaultAddressId: home.id,
      },
    ],
    orders,
  };
}
