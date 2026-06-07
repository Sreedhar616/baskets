import type { SiteSettings } from "@/types/db";

export interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  freeShippingApplied: boolean;
}

/**
 * Compute order totals from a subtotal (paise) and the site's shipping rules.
 * Shipping is admin-configured: a flat fee, waived above an optional threshold.
 * GST is not charged for now (taxAmount stays 0).
 */
export function computeTotals(
  subtotal: number,
  settings: Pick<SiteSettings, "flatShippingFee" | "freeShippingThreshold">
): OrderTotals {
  const { flatShippingFee, freeShippingThreshold } = settings;

  const qualifiesFree =
    freeShippingThreshold != null &&
    freeShippingThreshold > 0 &&
    subtotal >= freeShippingThreshold;

  const shippingFee = subtotal === 0 || qualifiesFree ? 0 : flatShippingFee;
  const taxAmount = 0;

  return {
    subtotal,
    shippingFee,
    taxAmount,
    total: subtotal + shippingFee + taxAmount,
    freeShippingApplied: qualifiesFree,
  };
}

/** Paise remaining until free shipping kicks in (0 if already free / no rule). */
export function amountToFreeShipping(
  subtotal: number,
  settings: Pick<SiteSettings, "freeShippingThreshold">
): number {
  const t = settings.freeShippingThreshold;
  if (t == null || t <= 0 || subtotal >= t) return 0;
  return t - subtotal;
}
