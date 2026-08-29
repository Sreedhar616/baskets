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
    <footer id="footer" className="bg-sand border-t-2 border-linen">
      {/* Main footer content */}
      <div className="container-page py-6 md:py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          {/* Brand section */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-2">{SITE.name}</h3>
            <p className="text-xs text-ink-soft mb-2">{SITE.tagline}</p>
            <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">
              Traditional handwoven baskets and bags crafted by skilled artisans in India.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-clay hover:bg-cream hover:text-clay transition-colors"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href={whatsappLink(phone, "Hi! I'd like to know more about your handmade baskets.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-clay hover:bg-cream hover:text-clay transition-colors"
              >
                <WhatsAppIcon size={14} />
              </a>
              <a
                href={`tel:${phone}`}
                aria-label="Call"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-clay hover:bg-cream hover:text-clay transition-colors"
              >
                <Phone size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-ink mb-2 uppercase text-xs tracking-wider">Quick Links</h4>
            <ul className="space-y-1 text-xs text-ink-soft">
              <li><Link href="/" className="hover:text-clay transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-clay transition-colors">Shop</Link></li>
              <li><a href="#footer" className="hover:text-clay transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-clay transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-ink mb-2 uppercase text-xs tracking-wider">Collections</h4>
            <ul className="space-y-1 text-xs text-ink-soft">
              {categories.slice(0, 4).map((c) => (
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
            <h4 className="font-semibold text-ink mb-2 uppercase text-xs tracking-wider">Contact</h4>
            <ul className="space-y-1 text-xs text-ink-soft">
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
                  className="inline-flex items-center gap-1 hover:text-clay transition-colors text-xs mt-1"
                >
                  <WhatsAppIcon size={12} /> Catalogue
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-linen pt-3 text-center text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="mt-1 text-xs">Handmade in India · Free shipping over ₹999</p>
        </div>
      </div>
    </footer>
  );
}
