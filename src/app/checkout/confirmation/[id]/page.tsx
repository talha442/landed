import type { Metadata } from "next";
import { Confirmation } from "./Confirmation";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function ConfirmationPage({ params }: PageProps<"/checkout/confirmation/[id]">) {
  return <Confirmation id={(await params).id} />;
}
