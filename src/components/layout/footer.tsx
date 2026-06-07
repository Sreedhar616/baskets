import Link from "next/link";
import { Phone } from "lucide-react";
import { getSettings, getCategories } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { whatsappLink } from "@/lib/utils";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";

export async function Footer() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);
  const phone = settings.contactPhone || SITE.phone;
  const instagram = settings.instagramUrl || SITE.instagramUrl;

  return (
    <footer className="mt-20 border-t border-border bg-sand">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-2xl">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">{SITE.tagline}. Handcrafted with care, delivered across India.</p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:bg-cream"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href={whatsappLink(phone, "Hi! I'd like to know more about your handmade baskets.")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:bg-cream"
            >
              <WhatsAppIcon size={18} />
            </a>
            <a
              href={`tel:${phone}`}
              aria-label="Call"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:bg-cream"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" className="hover:text-ink">
                All Products
              </Link>
            </li>
            <li>
              <a
                href={SITE.whatsappCatalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-ink"
              >
                <WhatsAppIcon size={14} /> WhatsApp Catalogue
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li><Link href="/happy-customers" className="hover:text-ink">Happy Customers</Link></li>
            <li><Link href="/#reviews" className="hover:text-ink">Reviews</Link></li>
            <li><Link href="/account" className="hover:text-ink">My Account</Link></li>
            <li><Link href="/cart" className="hover:text-ink">Cart</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>
              <a href={`tel:${phone}`} className="hover:text-ink">
                {phone}
              </a>
            </li>
            <li>Mon–Sat, 10am–7pm</li>
            <li>Cash on Delivery & UPI</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-soft md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Handmade in India · Free shipping over ₹999</p>
        </div>
      </div>
    </footer>
  );
}
