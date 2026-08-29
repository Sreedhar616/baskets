import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * Editorial hero: an elegant two-column layout pairing a tall, refined
 * portrait of women weaving baskets with classic typography. Subtle
 * entrance and ambient animations add a premium, lively feel.
 */
export function HomeHero() {
  return (
    <section className="bg-cream border-b-2 border-linen overflow-hidden">
      <div className="container-page py-10 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Left: copy */}
          <div className="order-2 text-center md:order-1 md:text-left">
            <h1
              className="animate-fade-rise font-serif text-4xl md:text-5xl lg:text-6xl text-ink mb-4 text-balance"
              style={{ animationDelay: "0s" }}
            >
              Handwoven with Heart
            </h1>
            <p
              className="animate-fade-rise text-sm md:text-base text-ink-soft max-w-md mx-auto md:mx-0 mb-8 leading-relaxed"
              style={{ animationDelay: "0.16s" }}
            >
              Each basket is woven by skilled artisans using traditional
              techniques passed down through generations.
            </p>

            {/* CTA buttons */}
            <div
              className="animate-fade-rise flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-6"
              style={{ animationDelay: "0.24s" }}
            >
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

            <p
              className="animate-fade-rise text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft/70"
              style={{ animationDelay: "0.3s" }}
            >
              Made in India
            </p>
          </div>

          {/* Right: tall editorial image with ambient zoom */}
          <div className="order-1 md:order-2">
            <div
              className="animate-fade-rise relative mx-auto w-full max-w-md"
              style={{ animationDelay: "0.12s" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-linen shadow-xl bg-sand">
                <Image
                  src="/images/hero-baskets.png"
                  alt="Women artisans weaving handmade baskets by hand"
                  fill
                  priority
                  sizes="(min-width: 768px) 420px, 90vw"
                  className="animate-slow-zoom object-cover"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem]" />
              </div>

              {/* Floating heritage badge */}
              <div className="animate-soft-float absolute -bottom-4 -left-2 md:-left-6 rounded-full border border-linen bg-cream px-5 py-3 shadow-lg">
                <p className="font-serif text-lg leading-none text-clay">100%</p>
                <p className="text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft">
                  Handmade
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
