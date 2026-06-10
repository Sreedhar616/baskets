import "server-only";
import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";
import { formatINR, whatsappLink } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import type { PaymentMethod, ShippingAddress } from "@/types/db";

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  items: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: ShippingAddress;
}

function itemsTable(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.quantity}</td><td style="padding:6px 0;text-align:right">${formatINR(
          i.lineTotal
        )}</td></tr>`
    )
    .join("");
}

function customerHtml(d: OrderEmailData): string {
  const pay = d.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online";
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#26201b">
    <h2 style="font-family:Georgia,serif;color:#c2552f">Thank you for your order!</h2>
    <p>Hi ${d.customerName}, we've received your order <strong>${d.orderNumber}</strong> and will get it ready with care.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${itemsTable(d.items)}
      <tr><td style="padding-top:10px">Shipping</td><td style="padding-top:10px;text-align:right">${
        d.shippingFee === 0 ? "Free" : formatINR(d.shippingFee)
      }</td></tr>
      <tr><td style="padding-top:6px;font-weight:bold">Total (${pay})</td><td style="padding-top:6px;text-align:right;font-weight:bold">${formatINR(
    d.total
  )}</td></tr>
    </table>
    <p style="font-size:13px;color:#5b4f45">Delivering to: ${d.address.line1}, ${
    d.address.line2 ? d.address.line2 + ", " : ""
  }${d.address.city}, ${d.address.state} - ${d.address.pincode}</p>
    <p style="font-size:13px;color:#5b4f45">Questions? WhatsApp or call us at ${SITE.phone}.</p>
    <p style="margin-top:20px">— ${SITE.name}</p>
  </div>`;
}

function ownerHtml(d: OrderEmailData): string {
  const pay = d.paymentMethod === "cod" ? "COD" : "Online (paid)";
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#26201b">
    <h2 style="font-family:Georgia,serif">New order ${d.orderNumber} (${pay})</h2>
    <p><strong>${d.customerName}</strong> · ${d.customerPhone}${
    d.customerEmail ? " · " + d.customerEmail : ""
  }</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${itemsTable(d.items)}
      <tr><td style="padding-top:6px;font-weight:bold">Total</td><td style="padding-top:6px;text-align:right;font-weight:bold">${formatINR(
        d.total
      )}</td></tr>
    </table>
    <p style="font-size:13px;color:#5b4f45">Ship to: ${d.address.line1}, ${
    d.address.line2 ? d.address.line2 + ", " : ""
  }${d.address.city}, ${d.address.state} - ${d.address.pincode}</p>
  </div>`;
}

/**
 * Send the customer confirmation + owner alert emails via Resend.
 * No-ops (returns false) when Resend isn't configured, so checkout never fails
 * just because email isn't set up yet.
 */
export async function sendOrderEmails(d: OrderEmailData): Promise<boolean> {
  if (!isResendConfigured()) return false;
  try {
    const resend = new Resend(env.resendApiKey);
    const from = env.orderFromEmail;

    const tasks: Promise<unknown>[] = [];
    if (d.customerEmail) {
      tasks.push(
        resend.emails.send({
          from: `${SITE.name} <${from}>`,
          to: d.customerEmail,
          subject: `Your ${SITE.name} order ${d.orderNumber}`,
          html: customerHtml(d),
        })
      );
    }
    if (env.ownerAlertEmail) {
      tasks.push(
        resend.emails.send({
          from: `${SITE.name} <${from}>`,
          to: env.ownerAlertEmail,
          subject: `New order ${d.orderNumber} — ${formatINR(d.total)}`,
          html: ownerHtml(d),
        })
      );
    }
    await Promise.allSettled(tasks);
    return true;
  } catch (e) {
    console.error("sendOrderEmails failed", e);
    return false;
  }
}

/** Build a wa.me link a customer can tap to confirm their order with the store. */
export function orderWhatsappLink(
  phone: string,
  orderNumber: string,
  total: number
): string {
  const msg = `Hi ${SITE.name}! I just placed order ${orderNumber} (${formatINR(
    total
  )}). Please confirm. Thank you!`;
  return whatsappLink(phone, msg);
}
