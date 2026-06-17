import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { getCategories, getSettings } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { CartButton } from "./cart-button";
import { SearchBox } from "./search-box";
import { InstagramIcon } from "@/components/ui/icons";

export async function Header() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  const instagram = settings.instagramUrl ?? SITE.instagramUrl;

  return (
    <header className="sticky top-0 z-40 bg-cream border-b-2 border-linen">
      {/* Announcement bar */}
      {settings.announcementText && (
        <div className="bg-clay text-cream text-center py-2">
          <p className="text-xs font-medium tracking-wide">
            {settings.announcementText}
          </p>
        </div>
      )}

      {/* Main header with logo and navigation */}
      <div className="container-page py-4">
        {/* Top row: Logo centered, account + cart on right */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Left: Mobile search (hidden on desktop) */}
          <div className="flex-1 md:hidden">
            <SearchBox />
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex shrink-0 flex-col items-center gap-1">
            <div className="relative h-16 w-16 md:h-20 md:w-20">
              <Image
                src="/11.jpeg"
                alt="D's Designs Logo"
                fill
                priority
                sizes="80px"
                className="rounded-full object-cover"
              />
            </div>
            <span className="font-serif text-base md:text-lg tracking-wide text-ink leading-none">
              {SITE.name}
            </span>
          </Link>

          {/* Right: Account + Cart + Instagram */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-clay transition-colors"
            >
              <InstagramIcon size={18} />
            </a>
            <Link
              href="/account"
              aria-label="Account"
              className="inline-flex h-9 w-9 items-center justify-center hover:bg-sand rounded transition-colors"
            >
              <User size={18} />
            </Link>
            <CartButton />
          </div>
        </div>

        {/* Navigation row - always visible, no hamburger menu */}
        <nav className="border-t border-linen pt-3 md:border-0 md:pt-1">
          <ul className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto sm:gap-2 md:gap-3">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/products" },
              { label: "About Us", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  className="block rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-clay hover:text-cream md:text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop search - shown on larger screens */}
        <div className="hidden md:block mt-4 max-w-xs mx-auto">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
