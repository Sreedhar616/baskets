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
      <div className="container-page py-2 md:py-3">
        {/* Top row: Logo (left), Search + Icons (right), all in one line */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Left: Logo */}
          <Link
            href="/"
            aria-label={`${SITE.name} home`}
            className="flex shrink-0 items-center justify-center"
          >
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-linen bg-white shadow-sm md:h-14 md:w-14">
              <Image
                src="/11.jpeg"
                alt={`${SITE.name} logo`}
                width={72}
                height={72}
                priority
                className="h-[88%] w-[88%] object-contain"
              />
            </div>
          </Link>

          {/* Center: Search (on desktop only, takes available space) */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <SearchBox />
          </div>

          {/* Right: Icons + Mobile Search */}
          <div className="flex items-center justify-end gap-2 md:gap-4">
            {/* Mobile search icon */}
            <div className="md:hidden">
              <SearchBox />
            </div>
            
            {/* Instagram */}
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand transition-colors"
            >
              <InstagramIcon size={18} />
            </a>
            
            {/* Account */}
            <Link
              href="/account"
              aria-label="Account"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand transition-colors"
            >
              <User size={18} />
            </Link>
            
            {/* Cart */}
            <CartButton />
          </div>
        </div>

        {/* Navigation row - horizontal on every device, never hidden in a menu */}
        <nav className="border-t border-linen pt-2 mt-2 md:border-0 md:mt-2 md:pt-0">
          <ul className="flex flex-nowrap items-center justify-center gap-0.5 overflow-x-auto no-scrollbar sm:gap-1">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/products" },
              { label: "About Us", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-clay hover:text-cream md:px-4 md:py-2 md:text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
