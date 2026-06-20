import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getInstagramPosts, getSettings } from "@/lib/queries";
import { InstagramReels } from "@/components/instagram/instagram-embed";
import { InstagramIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Happy Customers",
  description:
    "Real customers with their handmade baskets and bags from D's Designs, straight from our Instagram.",
};

export default async function HappyCustomersPage() {
  const [posts, settings] = await Promise.all([
    getInstagramPosts(),
    getSettings(),
  ]);
  const instagram = settings.instagramUrl ?? "https://www.instagram.com/";

  return (
    <div className="container-page py-12 md:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">@designsofds</p>
        <h1 className="mt-2 text-4xl md:text-5xl">Happy Customers</h1>
        <p className="mt-4 text-ink-soft">
          We love seeing our baskets out in the world. Swipe through some of our
          favourite moments shared by customers on Instagram.
        </p>
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("outline", "md", "mt-6")}
        >
          <InstagramIcon size={18} /> Follow us on Instagram
        </a>
      </header>

      <div className="mt-12 mb-12 flex justify-center">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-linen shadow-lg bg-sand p-4">
          <div className="relative w-full h-auto">
            <Image
              src="/images/happy-customer-v2.jpg"
              alt="Happy customer with handmade basket"
              width={400}
              height={600}
              priority
              sizes="(min-width: 768px) 400px, 90vw"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <InstagramReels posts={posts} />
        <p className="mt-3 text-center text-xs text-ink-soft">Swipe up for more ↑</p>
      </div>

      <div className="mt-16 rounded-[2rem] bg-sand p-10 text-center">
        <h2 className="text-2xl md:text-3xl">Tag us in your photos</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Share your D&apos;s Designs basket and tag <strong>@designsofds</strong> to be
          featured here.
        </p>
        <Link href="/products" className={buttonClasses("primary", "md", "mt-6")}>
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
