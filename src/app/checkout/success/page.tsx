import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatINR, whatsappLink } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; paid?: string }>;
}) {
  const { order, total, paid } = await searchParams;
  const settings = await getSettings();
  const orderNumber = order ?? "your order";
  const totalPaise = total ? Number(total) : 0;

  const waMsg = `Hi ${SITE.name}! I just placed order ${orderNumber}${
    totalPaise ? ` (${formatINR(totalPaise)})` : ""
  }. Please confirm. Thank you!`;
  const wa = whatsappLink(settings.contactPhone, waMsg);

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-border bg-cream p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto text-sage" size={64} />
        <h1 className="mt-5 text-3xl md:text-4xl">Thank you!</h1>
        <p className="mt-3 text-ink-soft">
          {paid ? "Your payment was successful and your" : "Your"} order has been
          placed.
        </p>

        <div className="mt-6 rounded-xl bg-sand p-4">
          <p className="text-sm text-ink-soft">Order number</p>
          <p className="font-display text-2xl">{orderNumber}</p>
          {totalPaise > 0 && (
            <p className="mt-1 text-sm text-ink-soft">
              Total {formatINR(totalPaise)} {paid ? "· Paid" : "· Cash on Delivery"}
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          We&apos;ll get your order ready with care. Send us a quick message on
          WhatsApp to confirm and track it.
        </p>

        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "lg", "mt-6 w-full")}
        >
          <WhatsAppIcon size={18} /> Confirm on WhatsApp
        </a>
        <Link href="/products" className="mt-3 block text-sm text-clay hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
