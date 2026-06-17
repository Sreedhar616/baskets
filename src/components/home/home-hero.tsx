import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * Traditional hero: square image of artisans weaving baskets with
 * classic positioning and typography reflecting handcrafted heritage.
 */
export function HomeHero() {
  return (
    <section className="bg-cream border-b-2 border-linen">
      <div className="container-page py-8 md:py-12">
        {/* Traditional header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay mb-2">
            Handcrafted Excellence
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink mb-3">
            Handwoven with Heart
          </h1>
          <p className="text-sm md:text-base text-ink-soft max-w-2xl mx-auto">
            Each basket is woven by skilled artisans using traditional techniques passed down through generations.
          </p>
        </div>

        {/* Square hero image - women weaving baskets */}
        <div className="flex justify-center mb-8">
          <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-xl2 border border-linen shadow-sm bg-sand">
            <Image
              src="/images/artisans-weaving.png"
              alt="Women artisans weaving handmade baskets by hand"
              fill
              priority
              sizes="(min-width: 768px) 500px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/products" className={buttonClasses("primary", "lg")}>
            Shop now <ArrowRight size={18} />
          </Link>
          <a
            href={SITE.whatsappCatalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("outline", "lg")}
          >
            <WhatsAppIcon size={18} /> View Catalogue
          </a>
        </div>

        {/* Heritage text */}
        <div className="text-center text-xs md:text-sm text-ink-soft">
          <p className="font-medium">Made in India · Handcrafted Products</p>
        </div>
      </div>
    </section>
  );
}
