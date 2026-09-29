import type { Metadata } from "next";
import { Addresses } from "./Addresses";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return <Addresses />;
}
