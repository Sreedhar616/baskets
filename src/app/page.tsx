import Link from "next/link";
import Image from "next/image";
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
      {/* ---------------------- Editorial hero --------------------------- */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[460px] w-full overflow-hidden">
          <Image
            src="/products/7.jpg"
            alt="Handmade designer baskets by D's Designs"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/30 to-transparent" />
          <div className="container-page absolute inset-0 flex flex-col justify-center">
            <div className="max-w-xl text-cream">
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                Handmade · Premium · Made in India
              </p>
              <h1 className="mt-4 text-4xl font-semibold uppercase leading-[1.05] tracking-tight md:text-6xl">
                Baskets &amp; bags,<br />woven by hand
              </h1>
              <p className="mt-5 max-w-md text-sm text-cream/85 md:text-base">
                Beautifully crafted Chettinad, picnic, pooja and designer sets —
                durable, vibrant and made to last. Free shipping over ₹999.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className={buttonClasses("primary", "lg", "bg-cream text-ink hover:bg-cream/90")}
                >
                  Shop now <ArrowRight size={18} />
                </Link>
                <Link
                  href="/#categories"
                  className={buttonClasses("outline", "lg", "border-cream text-cream hover:bg-cream hover:text-ink")}
                >
                  Browse categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="container-page pb-12">
        <div className="relative overflow-hidden rounded-lg">
          <div className="relative h-[340px] w-full md:h-[420px]">
            <Image
              src="/products/5.jpg"
              alt="Happy customers with D's Designs baskets"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/55" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-cream">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cream/90">
                @designsofds on Instagram
              </p>
              <h2 className="mt-3 text-3xl uppercase tracking-tight text-cream md:text-4xl">
                Our happy customers
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-cream/85">
                See real customers with their handmade baskets and bags — or browse
                our full range on our WhatsApp catalogue.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/happy-customers"
                  className={buttonClasses("primary", "lg", "bg-cream text-ink hover:bg-cream/90")}
                >
                  View Happy Customers <ArrowRight size={18} />
                </Link>
                <a
                  href={SITE.whatsappCatalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("outline", "lg", "border-cream text-cream hover:bg-cream hover:text-ink")}
                >
                  <WhatsAppIcon size={18} /> WhatsApp Catalogue
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
