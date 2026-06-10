import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional support. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an integer amount of paise as an INR string.
 * All money in this app is stored as integer paise to avoid float drift.
 * e.g. formatINR(49900) -> "₹499"
 */
export function formatINR(paise: number, opts: { withDecimals?: boolean } = {}): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: opts.withDecimals ? 2 : 0,
    maximumFractionDigits: opts.withDecimals ? 2 : 0,
  }).format(rupees);
}

/** Convert a rupee number (e.g. from an admin form) into integer paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** URL-safe slug from a product or category name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The price (paise) to display for a product card/page. When the product has
 * sizes, use the lowest online size price; otherwise the base online price.
 * `from` is true when multiple sizes mean the price is a starting price.
 */
export function displayPrice(product: {
  price: number;
  sizes: { online: number }[];
}): { amount: number; from: boolean } {
  if (product.sizes.length) {
    const min = Math.min(...product.sizes.map((s) => s.online));
    return { amount: min, from: product.sizes.length > 1 };
  }
  return { amount: product.price, from: false };
}

/** Build a wa.me click-to-chat link with a pre-filled message. */
export function whatsappLink(phone: string, message: string): string {
  // Normalise to digits only; assume India (+91) when a bare 10-digit number is given.
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}
