import Link from "next/link";
import { Truck, ShieldCheck, HandHeart, BadgeIndianRupee, ArrowRight } from "lucide-react";
import { getCategories, getProducts } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { buttonClasses } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { CategoryRail } from "@/components/home/category-rail";
import { ReviewsSection } from "@/components/home/reviews-section";
import { WhatsAppIcon } from "@/components/ui/icons";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const featured = products.filter((p) => p.isFeatured);
  const showcase = (featured.length ? featured : products).slice(0, 12);

  return (
    <>
      {/* ------------------------- Landing band ------------------------- */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-sand to-cream">
        <div className="container-page py-14 text-center md:py-20">
          <p className="eyebrow">Handmade · Premium · Made in India</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl leading-[1.08] md:text-6xl">
            Baskets &amp; bags, <span className="text-clay">woven by hand.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft md:text-lg">
            Beautifully crafted Chettinad, picnic, pooja and designer sets —
            durable, vibrant and made to last. Free shipping over ₹999.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/products" className={buttonClasses("primary", "lg")}>
              Shop all products <ArrowRight size={18} />
            </Link>
            <a
              href={SITE.whatsappCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline", "lg")}
            >
              <WhatsAppIcon size={18} /> WhatsApp Catalogue
            </a>
          </div>
        </div>
      </section>

      {/* --------------------------- Trust band ------------------------- */}
      <section className="border-b border-border bg-cream">
        <div className="container-page grid grid-cols-2 gap-4 py-5 text-sm md:grid-cols-4">
          {[
            { icon: HandHeart, label: "Handmade with care" },
            { icon: Truck, label: "Free shipping over ₹999" },
            { icon: BadgeIndianRupee, label: "Cash on Delivery" },
            { icon: ShieldCheck, label: "Secure UPI & card payments" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={20} className="shrink-0 text-clay" />
              <span className="text-ink-soft">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------- Categories (side-scroll) ------------------ */}
      <section id="categories" className="container-page scroll-mt-24 py-12 md:py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="mt-2 text-2xl md:text-3xl">Find your weave</h2>
          </div>
          <Link href="/products" className="text-sm text-clay hover:underline">
            View all →
          </Link>
        </div>
        <CategoryRail categories={categories} />
      </section>

      {/* ----------------------- Products on home ----------------------- */}
      {showcase.length > 0 && (
        <section className="container-page py-4 md:py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Shop now</p>
              <h2 className="mt-2 text-2xl md:text-3xl">Our collection</h2>
            </div>
            <Link href="/products" className="text-sm text-clay hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/products" className={buttonClasses("outline", "lg")}>
              See all products <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* ----------------------------- Reviews -------------------------- */}
      <ReviewsSection />

      {/* ------------------------- Instagram CTA ------------------------ */}
      <section className="container-page pb-10">
        <div className="overflow-hidden rounded-[2rem] bg-clay px-6 py-12 text-center text-cream md:py-16">
          <p className="eyebrow text-gold">@designsofds on Instagram</p>
          <h2 className="mt-3 text-3xl text-cream md:text-4xl">Our happy customers</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-cream/80">
            See real customers with their handmade baskets and bags — or browse our
            full range on our WhatsApp catalogue.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/happy-customers"
              className={buttonClasses("primary", "lg", "bg-cream text-clay-dark hover:bg-cream/90")}
            >
              View Happy Customers <ArrowRight size={18} />
            </Link>
            <a
              href={SITE.whatsappCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline", "lg", "border-cream/30 text-cream hover:bg-cream/10")}
            >
              <WhatsAppIcon size={18} /> WhatsApp Catalogue
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
