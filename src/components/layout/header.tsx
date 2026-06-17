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
          <Link href="/" className="flex shrink-0 flex-col items-center">
            {/* Logo image if available, otherwise text */}
            <div className="h-14 w-14 relative">
              <Image
                src="/11.jpeg"
                alt="D's Designs Logo"
                fill
                className="object-contain"
              />
            </div>
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

        {/* Navigation row */}
        <nav className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 border-t border-linen pt-3 md:border-0 md:pt-0">
          <Link
            href="/"
            className="text-sm font-medium text-ink hover:text-clay transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-ink hover:text-clay transition-colors"
          >
            Shop
          </Link>
          <a
            href="#about"
            className="text-sm font-medium text-ink hover:text-clay transition-colors"
          >
            About Us
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-ink hover:text-clay transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Desktop search - shown on larger screens */}
        <div className="hidden md:block mt-4 max-w-xs mx-auto">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
