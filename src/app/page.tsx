import Link from "next/link";
import Image from "next/image";
import { Truck, ShieldCheck, HandHeart, BadgeIndianRupee, ArrowRight } from "lucide-react";
import { getCategories, getProducts } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { buttonClasses } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { CategoryRail } from "@/components/home/category-rail";
import { HomeHero } from "@/components/home/home-hero";
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
      {/* ---------------------- Illustration hero ----------------------- */}
      <HomeHero />

      {/* --------------------------- Trust band ------------------------- */}
      <section className="border-b border-border bg-ink text-cream">
        <div className="container-page grid grid-cols-2 gap-4 py-5 text-sm md:grid-cols-4">
          {[
            { icon: HandHeart, label: "Handmade with care" },
            { icon: Truck, label: "Free shipping over ₹999" },
            { icon: BadgeIndianRupee, label: "Cash on Delivery" },
            { icon: ShieldCheck, label: "Secure UPI & card payments" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={20} className="shrink-0" />
              <span className="text-cream/85">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------- Categories (side-scroll) ------------------ */}
      <section id="categories" className="container-page scroll-mt-24 py-10 md:py-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="mt-2 text-2xl md:text-3xl">Find your weave</h2>
          </div>
          <Link href="/products" className="text-xs font-medium uppercase tracking-wide text-ink hover:underline">
            View all →
          </Link>
        </div>
        <CategoryRail categories={categories} />
      </section>

      {/* ----------------------- Products on home ----------------------- */}
      {showcase.length > 0 && (
        <section className="container-page py-8 md:py-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Shop now</p>
              <h2 className="mt-2 text-2xl md:text-3xl">Our collection</h2>
            </div>
            <Link href="/products" className="text-xs font-medium uppercase tracking-wide text-ink hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
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
      <section className="container-page py-10 md:py-16">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-sand md:grid-cols-2 md:gap-0">
          {/* Image */}
          <div className="relative aspect-square w-full md:aspect-auto md:min-h-[500px] md:order-2">
            <Image
              src="/images/happy-customers.png"
              alt="Happy customer with a D's Designs handwoven basket"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority={false}
            />
          </div>
          
          {/* Content */}
          <div className="flex flex-col justify-center gap-4 p-5 sm:p-6 md:order-1 md:gap-6 md:p-8 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay">
              @designsofds on Instagram
            </p>
            <h2 className="text-2xl font-medium tracking-tight text-balance sm:text-3xl md:text-3xl lg:text-4xl">
              Our happy customers
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft md:text-base">
              See real customers with their handmade baskets and bags — or browse our full range on our WhatsApp catalogue.
            </p>
            <div className="mt-2 flex flex-col gap-3 md:mt-4 md:flex-col lg:flex-row lg:gap-3">
              <Link href="/happy-customers" className={buttonClasses("primary", "md")}>
                View Happy Customers <ArrowRight size={18} />
              </Link>
              <a
                href={SITE.whatsappCatalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("outline", "md")}
              >
                <WhatsAppIcon size={18} /> WhatsApp Catalogue
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
