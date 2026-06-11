import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * Photographic hero: warm lifestyle shot of handwoven baskets with brand
 * copy on a soft linen backdrop.
 */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-linen">
      {/* Decorative soft circles */}
      <div className="pointer-events-none absolute -right-10 -top-24 h-[420px] w-[420px] rounded-full bg-sand" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-60px] h-[300px] w-[300px] rounded-full bg-cream/60" />

      <div className="container-page relative grid items-center gap-8 py-10 text-center md:grid-cols-2 md:gap-10 md:py-20 md:text-left">
        {/* Copy */}
        <div className="relative z-10 order-2 mx-auto max-w-xl md:order-1 md:mx-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clay md:text-sm md:tracking-[0.25em]">
            Handwoven · Natural · Crafted
          </p>
          <h1 className="mt-3 text-balance text-4xl leading-[1.04] text-ink sm:text-5xl md:text-6xl">
            Baskets &amp; bags,
            <br />
            <span className="italic text-clay">woven by hand.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm text-ink-soft md:mx-0 md:text-base">
            Beautifully crafted Chettinad, picnic, pooja and designer sets —
            durable, vibrant and made to last.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link href="/products" className={buttonClasses("primary", "lg")}>
              Shop now <ArrowRight size={18} />
            </Link>
            <a
              href={SITE.whatsappCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline", "lg")}
            >
              <WhatsAppIcon size={18} /> Catalogue
            </a>
          </div>
        </div>

        {/* Hero photo */}
        <div className="relative z-10 order-1 flex justify-center md:order-2 md:justify-end">
          <div className="relative aspect-square w-64 overflow-hidden rounded-full border-8 border-cream shadow-xl sm:w-72 md:w-96 md:rounded-[2rem]">
            <Image
              src="/images/hero-baskets.png"
              alt="Handwoven wicker baskets in warm natural light"
              fill
              priority
              sizes="(min-width: 768px) 384px, 288px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
