import type { SiteSettings } from "@/types/db";

/** Static brand/site configuration used across the UI. */
export const SITE = {
  name: "D's Designs",
  tagline: "Handmade baskets & bags",
  description:
    "Premium handmade baskets and bags — Chettinad, picnic, pooja, wire and designer sets. Handcrafted with care, delivered across India.",
  phone: "9344773028",
  instagramHandle: "designsofds",
  instagramUrl: "https://www.instagram.com/designsofds",
  // WhatsApp product catalogue (wa.me/c/<number>).
  whatsappCatalogUrl: "https://wa.me/c/919344773028",
  email: "",
} as const;

/**
 * Default site settings used when Supabase is not yet connected.
 * Money is in paise. The admin can edit all of these once the DB is live.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: SITE.name,
  contactPhone: SITE.phone,
  contactEmail: null,
  instagramUrl: SITE.instagramUrl,
  flatShippingFee: 7000, // ₹70
  freeShippingThreshold: 99900, // free over ₹999
  codEnabled: true,
  onlinePaymentEnabled: true,
  announcementText: "Handmade with love · Free shipping over ₹999 · COD available",
};

/** The nine product categories, in display order. */
export const CATEGORY_SEED = [
  {
    slug: "chettinad-set",
    name: "Chettinad Set",
    description:
      "Vibrant, traditional Chettinad-style woven sets in bold checks — a graduated set of totes for every occasion.",
    image: "/products/1.jpg",
  },
  {
    slug: "train-set",
    name: "Train Set",
    description:
      "Neatly nesting graduated baskets that stack like a train — practical, sturdy and beautifully woven.",
    image: "/products/9.jpg",
  },
  {
    slug: "casserole-set",
    name: "Casserole Set",
    description:
      "Carry your casseroles and tiffins in style. Roomy woven carriers including a round casserole bag.",
    image: "/products/2.jpg",
  },
  {
    slug: "designer-baskets-set",
    name: "Designer Baskets Set",
    description:
      "Our most colourful, statement-making designer weave — a curated set of bright, eye-catching baskets.",
    image: "/products/7.jpg",
  },
  {
    slug: "pooja-baskets",
    name: "Pooja Baskets",
    description:
      "Elegant baskets for festivals, return gifts and pooja essentials — handwoven for auspicious occasions.",
    image: "/products/8.jpg",
  },
  {
    slug: "imported-baskets",
    name: "Imported Baskets",
    description:
      "Premium imported-style weaves with a refined monochrome finish and clear handles.",
    image: "/products/6.jpg",
  },
  {
    slug: "wire-baskets",
    name: "Wire Baskets",
    description:
      "Sturdy little wire-woven baskets — perfect for storage, gifting and everyday carry.",
    image: "/products/3.jpg",
  },
  {
    slug: "wire-bags",
    name: "Wire Bags",
    description:
      "Durable handwoven wire bags that hold their shape — lightweight, washable and built to last.",
    // Placeholder until a dedicated photo is supplied.
    image: "/products/7.jpg",
  },
  {
    slug: "picnic-baskets",
    name: "Picnic Baskets",
    description:
      "Bright, roomy picnic baskets for outings, markets and beach days — a cheerful graduated set.",
    image: "/products/5.jpg",
  },
] as const;
