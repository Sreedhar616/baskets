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
          {/* Left: Empty on mobile to balance layout */}
          <div className="flex-1"></div>

          {/* Center: Logo */}
          <Link
            href="/"
            aria-label={`${SITE.name} home`}
            className="flex shrink-0 items-center justify-center"
          >
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden md:h-24 md:w-24">
              <Image
                src="/logo-ds-designs.png"
                alt={`${SITE.name} logo`}
                width={96}
                height={96}
                priority
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Right: Account + Cart + Instagram */}
          <div className="flex flex-1 items-center justify-end gap-5 md:gap-6">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center hover:bg-sand rounded transition-colors"
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

        {/* Search below icons - mobile only */}
        <div className="mb-4 md:hidden">
          <SearchBox />
        </div>

        {/* Navigation row - horizontal on every device, never hidden in a menu */}
        <nav className="border-t border-linen pt-3 md:border-0 md:pt-0">
          <ul className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto no-scrollbar sm:gap-2">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/products" },
              { label: "About Us", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-clay hover:text-cream md:text-sm"
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
