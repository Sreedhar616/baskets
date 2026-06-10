import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * Coded illustration hero (no photo needed). Warm cream backdrop with soft
 * decorative circles + leaves and an SVG woven basket, matching the brand mock.
 */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#f3e7d3]">
      {/* Decorative soft circles */}
      <div className="pointer-events-none absolute -right-10 -top-24 h-[420px] w-[420px] rounded-full bg-[#f7eede]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-60px] h-[300px] w-[300px] rounded-full bg-[#efe0c8]" />

      <div className="container-page relative grid items-center gap-6 py-14 md:grid-cols-2 md:py-20">
        {/* Copy */}
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay md:text-sm">
            Handwoven · Natural · Crafted
          </p>
          <h1 className="mt-3 text-5xl leading-[1.02] text-ink md:text-6xl">
            Baskets &amp; bags,
            <br />
            <span className="italic text-clay">woven by hand.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-soft">
            Beautifully crafted Chettinad, picnic, pooja and designer sets —
            durable, vibrant and made to last. Free shipping over ₹999.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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

        {/* Illustration */}
        <div className="relative z-10 flex justify-center md:justify-end">
          <BasketArt />
        </div>
      </div>
    </section>
  );
}

/** Simple flat-style woven basket illustration with fruit. */
function BasketArt() {
  return (
    <svg viewBox="0 0 360 360" className="h-64 w-64 drop-shadow-xl md:h-80 md:w-80" role="img" aria-label="Handwoven basket with fruit">
      {/* leaves */}
      <path d="M70 70 q-22 8 -14 30 q22 -8 14 -30Z" fill="#9bb083" />
      <path d="M300 250 q22 6 16 28 q-22 -6 -16 -28Z" fill="#9bb083" />
      {/* shadow */}
      <ellipse cx="180" cy="320" rx="110" ry="16" fill="#d8c4a3" />
      {/* handle */}
      <path d="M118 150 q62 -90 124 0" fill="none" stroke="#caa06a" strokeWidth="14" strokeLinecap="round" />
      {/* fruit */}
      <circle cx="150" cy="150" r="22" fill="#c75f4b" />
      <circle cx="195" cy="145" r="26" fill="#e0a23c" />
      <circle cx="225" cy="160" r="18" fill="#7fa15a" />
      {/* basket body */}
      <path d="M104 160 h152 l-16 150 h-120 Z" fill="#c99a5e" />
      {/* basket rim */}
      <ellipse cx="180" cy="160" rx="78" ry="20" fill="#b98948" />
      <ellipse cx="180" cy="158" rx="64" ry="14" fill="#6f4a27" />
      {/* weave lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <path
          key={i}
          d={`M${112 + i * 0} ${190 + i * 20} q68 14 136 0`}
          fill="none"
          stroke="#b8893f"
          strokeWidth="3"
          opacity="0.6"
        />
      ))}
    </svg>
  );
}
