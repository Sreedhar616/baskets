import Link from "next/link";
import { User, ChevronDown } from "lucide-react";
import { getCategories, getSettings } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { CartButton } from "./cart-button";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  return (
    <header className="sticky top-0 z-40">
      {settings.announcementText && (
        <div className="bg-clay text-cream">
          <p className="container-page py-2 text-center text-xs tracking-wide">
            {settings.announcementText}
          </p>
        </div>
      )}

      <div className="border-b border-border bg-cream/90 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3 md:h-20">
          <MobileNav categories={categories} />

          <Link href="/" className="flex items-baseline gap-1 md:mr-4">
            <span className="font-display text-2xl leading-none md:text-[1.7rem]">
              {SITE.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="rounded-full px-3 py-2 text-sm hover:bg-sand"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="rounded-full px-3 py-2 text-sm hover:bg-sand"
            >
              All Products
            </Link>

            <div className="group relative">
              <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm hover:bg-sand">
                Categories <ChevronDown size={14} />
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="grid w-[34rem] grid-cols-2 gap-1 rounded-2xl border border-border bg-cream p-3 shadow-lg">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/happy-customers"
              className="rounded-full px-3 py-2 text-sm hover:bg-sand"
            >
              Happy Customers
            </Link>
            <Link
              href="/#reviews"
              className="rounded-full px-3 py-2 text-sm hover:bg-sand"
            >
              Reviews
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/account"
              aria-label="Account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand"
            >
              <User size={20} />
            </Link>
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
