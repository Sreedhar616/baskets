import type { Category, InstagramPost, Product, Review } from "@/types/db";
import { CATEGORY_SEED } from "@/lib/constants";

/**
 * Local sample dataset. Used as a fallback so the whole site renders and is
 * fully demoable BEFORE Supabase is connected (see lib/queries.ts). Once real
 * Supabase env vars are present, queries hit the database instead of this file.
 */

export const sampleCategories: Category[] = CATEGORY_SEED.map((c, i) => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
  description: c.description,
  imageUrl: c.image,
  sortOrder: i,
  isActive: true,
}));

type Seed = {
  cat: string;
  name: string;
  price: number; // paise
  comparePrice?: number;
  featured?: boolean;
  blurb: string;
};

const PRODUCT_SEED: Seed[] = [
  {
    cat: "chettinad-set",
    name: "Chettinad Tote — Set of 5",
    price: 134900,
    comparePrice: 159900,
    featured: true,
    blurb:
      "A graduated set of five handwoven Chettinad totes in vivid checks. Strong handles, holds its shape, and ages beautifully.",
  },
  {
    cat: "chettinad-set",
    name: "Chettinad Mini Pair",
    price: 64900,
    blurb: "Two smaller Chettinad totes — ideal for gifting and quick errands.",
  },
  {
    cat: "train-set",
    name: "Train Basket — Nesting Set of 5",
    price: 119900,
    featured: true,
    blurb:
      "Five sturdy baskets that nest neatly like a train. The everyday workhorse of the collection.",
  },
  {
    cat: "casserole-set",
    name: "Casserole Carrier — Set of 5",
    price: 124900,
    blurb:
      "Roomy woven carriers, including a round casserole bag, to take hot dishes anywhere in style.",
  },
  {
    cat: "designer-baskets-set",
    name: "Designer Rainbow Set",
    price: 149900,
    comparePrice: 174900,
    featured: true,
    blurb:
      "Our brightest, boldest designer weave — a statement set that turns heads at every market.",
  },
  {
    cat: "pooja-baskets",
    name: "Pooja Basket — Set of 5",
    price: 109900,
    blurb:
      "Auspicious handwoven baskets for festivals, return gifts and pooja essentials.",
  },
  {
    cat: "imported-baskets",
    name: "Imported Monochrome Set",
    price: 139900,
    featured: true,
    blurb:
      "A refined imported-style weave in classic black & white with clear handles.",
  },
  {
    cat: "wire-baskets",
    name: "Wire Basket — Set of 5",
    price: 99900,
    blurb: "Sturdy little wire-woven baskets for storage, gifting and carry.",
  },
  {
    cat: "wire-bags",
    name: "Wire Bag — Large",
    price: 74900,
    blurb: "A durable, washable handwoven wire bag that holds its shape trip after trip.",
  },
  {
    cat: "picnic-baskets",
    name: "Picnic Basket — Set of 5",
    price: 129900,
    featured: true,
    blurb:
      "Bright, roomy picnic baskets for outings, beach days and weekend markets.",
  },
];

const catBySlug = Object.fromEntries(sampleCategories.map((c) => [c.slug, c]));

export const sampleProducts: Product[] = PRODUCT_SEED.map((p, i) => {
  const cat = catBySlug[p.cat];
  const slug = `${p.cat}-${i + 1}`;
  return {
    id: slug,
    categoryId: cat.id,
    categorySlug: cat.slug,
    categoryName: cat.name,
    name: p.name,
    slug,
    description: p.blurb,
    price: p.price,
    comparePrice: p.comparePrice ?? null,
    images: cat.imageUrl ? [cat.imageUrl] : [],
    sizes: [],
    stock: 25,
    isActive: true,
    isFeatured: Boolean(p.featured),
  };
});

export const sampleReviews: Review[] = [
  {
    id: "r1",
    productId: null,
    authorName: "Priya R.",
    rating: 5,
    body:
      "Absolutely gorgeous baskets! The weave is so neat and they feel really premium. Got the Chettinad set and use it everywhere.",
    photoUrl: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "r2",
    productId: null,
    authorName: "Lakshmi S.",
    rating: 5,
    body:
      "Ordered the casserole set for a wedding return gift. Everyone loved them. Sturdy and beautifully made.",
    photoUrl: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "r3",
    productId: null,
    authorName: "Anand K.",
    rating: 5,
    body:
      "Fast delivery and the colours are even brighter in person. The picnic set is our weekend favourite now.",
    photoUrl: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "r4",
    productId: null,
    authorName: "Meera V.",
    rating: 4,
    body:
      "Lovely handmade quality. Wish there were even more colours — will definitely order again.",
    photoUrl: null,
    sortOrder: 3,
    isActive: true,
  },
];

export const sampleInstagramPosts: InstagramPost[] = [
  {
    id: "ig1",
    postUrl: "https://www.instagram.com/p/Cexample1/",
    embedHtml: null,
    caption: "Our customer with her brand-new Chettinad set ✨",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "ig2",
    postUrl: "https://www.instagram.com/p/Cexample2/",
    embedHtml: null,
    caption: "Picnic season is here 🧺",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "ig3",
    postUrl: "https://www.instagram.com/p/Cexample3/",
    embedHtml: null,
    caption: "Festive pooja baskets, handwoven with love 🪔",
    sortOrder: 2,
    isActive: true,
  },
];
