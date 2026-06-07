import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <CheckoutForm settings={settings} />;
}
