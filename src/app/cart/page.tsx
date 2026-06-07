import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const settings = await getSettings();
  return <CartView settings={settings} />;
}
