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
    <footer className="bg-sand border-t-2 border-linen">
      {/* Heritage banner */}
      <div className="bg-clay text-cream">
        <div className="container-page py-4 text-center">
          <p className="font-serif text-lg md:text-xl">Made in India · Handcrafted Products</p>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4 mb-8">
          {/* Brand section */}
          <div>
            <h3 className="font-serif text-xl text-ink mb-3">{SITE.name}</h3>
            <p className="text-sm text-ink-soft mb-4">{SITE.tagline}</p>
            <p className="text-xs text-ink-soft leading-relaxed">
              Traditional handwoven baskets and bags crafted by skilled artisans in India. Each piece tells a story of heritage and craftsmanship.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded border border-clay hover:bg-cream hover:text-clay transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={whatsappLink(phone, "Hi! I'd like to know more about your handmade baskets.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded border border-clay hover:bg-cream hover:text-clay transition-colors"
              >
                <WhatsAppIcon size={18} />
              </a>
              <a
                href={`tel:${phone}`}
                aria-label="Call"
                className="inline-flex h-10 w-10 items-center justify-center rounded border border-clay hover:bg-cream hover:text-clay transition-colors"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-ink mb-4 uppercase text-xs tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li><Link href="/" className="hover:text-clay transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-clay transition-colors">Shop</Link></li>
              <li><Link href="/happy-customers" className="hover:text-clay transition-colors">About Us</Link></li>
              <li><a href="#contact" className="hover:text-clay transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-ink mb-4 uppercase text-xs tracking-wider">Collections</h4>
            <ul className="space-y-2 text-sm text-ink-soft">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-clay transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-ink mb-4 uppercase text-xs tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>
                <a href={`tel:${phone}`} className="hover:text-clay transition-colors font-medium">
                  {phone}
                </a>
              </li>
              <li>Mon–Sat: 10am–7pm</li>
              <li>Cash on Delivery</li>
              <li>
                <a
                  href={SITE.whatsappCatalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-clay transition-colors text-xs mt-2"
                >
                  <WhatsAppIcon size={14} /> WhatsApp Catalogue
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-linen pt-6 text-center text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="mt-2 text-xs">Handmade in India · Free shipping on orders over ₹999</p>
        </div>
      </div>
    </footer>
  );
}
