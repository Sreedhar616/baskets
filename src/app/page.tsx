import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, HandHeart, BadgeIndianRupee, ArrowRight } from "lucide-react";
import { getCategories, getFeaturedProducts } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { buttonClasses } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { ReviewsSection } from "@/components/home/reviews-section";
import { WhatsAppIcon } from "@/components/ui/icons";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      {/* ---------------------------- Hero ---------------------------- */}
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="eyebrow">Handmade · Premium · Made in India</p>
          <h1 className="mt-4 text-4xl leading-[1.05] md:text-6xl">
            Baskets & bags,
            <br />
            <span className="text-clay">woven by hand.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-soft md:text-lg">
            Beautifully crafted Chettinad, picnic, pooja and designer sets —
            durable, vibrant and made to last. Free shipping over ₹999.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className={buttonClasses("primary", "lg")}>
              Shop the collection <ArrowRight size={18} />
            </Link>
            <Link href="/#categories" className={buttonClasses("outline", "lg")}>
              Browse categories
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand md:aspect-[5/6]">
            <Image
              src="/products/7.jpg"
              alt="Handmade designer baskets by D's Designs"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border bg-cream px-5 py-3 shadow-lg md:block">
            <p className="font-display text-lg">100% Handwoven</p>
            <p className="text-xs text-ink-soft">Crafted to order, with love</p>
          </div>
        </div>
      </section>

      {/* ------------------------ Trust band -------------------------- */}
      <section className="border-y border-border bg-sand">
        <div className="container-page grid grid-cols-2 gap-4 py-6 text-sm md:grid-cols-4">
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

      {/* ------------------------ Categories -------------------------- */}
      <section id="categories" className="container-page scroll-mt-24 py-16 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="mt-2 text-3xl md:text-4xl">Find your weave</h2>
          </div>
          <Link href="/products" className="hidden text-sm text-clay hover:underline md:block">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="group relative block overflow-hidden rounded-2xl">
              <div className="relative aspect-[4/3] bg-sand">
                <Image
                  src={c.imageUrl ?? "/products/1.jpg"}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-display text-lg text-cream md:text-xl">{c.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ----------------------- Featured ----------------------------- */}
      {featured.length > 0 && (
        <section className="container-page py-4 md:py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Featured pieces</h2>
            </div>
            <Link href="/products" className="hidden text-sm text-clay hover:underline md:block">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------- Reviews ---------------------------- */}
      <ReviewsSection />

      {/* ---------------------- Instagram CTA ------------------------- */}
      <section className="container-page pb-8">
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
