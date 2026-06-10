import Link from "next/link";
import { User, ChevronDown, Search } from "lucide-react";
import { getCategories, getSettings } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { CartButton } from "./cart-button";
import { MobileNav } from "./mobile-nav";
import { InstagramIcon, FacebookIcon, YoutubeIcon } from "@/components/ui/icons";

export async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  const instagram = settings.instagramUrl ?? SITE.instagramUrl;

  return (
    <header className="sticky top-0 z-40">
      {/* Top black bar: social icons + announcement */}
      <div className="bg-ink text-cream">
        <div className="container-page flex h-10 items-center justify-between gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-cream/70">
              <InstagramIcon size={16} />
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-cream/70">
              <FacebookIcon size={16} />
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-cream/70">
              <YoutubeIcon size={16} />
            </a>
          </div>
          {settings.announcementText && (
            <p className="flex-1 text-center text-xs font-medium tracking-wide md:flex-none">
              {settings.announcementText}
            </p>
          )}
          <div className="hidden w-[88px] md:block" />
        </div>
      </div>

      {/* Main bar: centered logo, search + account + cart */}
      <div className="border-b border-border bg-cream">
        <div className="container-page flex h-20 items-center">
          {/* Left: mobile menu / desktop search */}
          <div className="flex flex-1 items-center">
            <MobileNav categories={categories} />
            <Link
              href="/products"
              aria-label="Search products"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-sand md:inline-flex"
            >
              <Search size={20} />
            </Link>
          </div>

          {/* Center: brand wordmark */}
          <Link href="/" className="flex shrink-0 flex-col items-center">
            <span className="text-2xl font-semibold uppercase leading-none tracking-[0.15em] md:text-3xl">
              {SITE.name}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.4em] text-ink-soft">
              {SITE.tagline.split(" ")[0]}
            </span>
          </Link>

          {/* Right: account + cart */}
          <div className="flex flex-1 items-center justify-end gap-1">
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

        {/* Centered nav row (desktop) */}
        <nav className="hidden items-center justify-center gap-7 pb-3 md:flex">
          <Link href="/" className="text-sm hover:underline">Home</Link>
          <Link href="/products" className="text-sm hover:underline">All Products</Link>
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm hover:underline">
              Collections <ChevronDown size={14} />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              <div className="grid w-[34rem] grid-cols-2 gap-1 rounded-md border border-border bg-cream p-3 shadow-lg">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link href="/happy-customers" className="text-sm hover:underline">Happy Customers</Link>
          <Link href="/#reviews" className="text-sm hover:underline">Reviews</Link>
        </nav>
      </div>
    </header>
  );
}
