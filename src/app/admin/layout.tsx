import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Star,
  Settings,
  Home,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { InstagramIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/instagram", label: "Instagram", icon: InstagramIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl">Admin needs Supabase</h1>
        <p className="mt-2 text-ink-soft">
          Connect Supabase (see setup.md) and make yourself an admin to manage
          products and orders.
        </p>
        <Link href="/" className="mt-6 inline-block text-clay hover:underline">← Back to site</Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl">Not authorised</h1>
        <p className="mt-2 text-ink-soft">
          Your account doesn&apos;t have admin access. Set
          <code className="mx-1 rounded bg-sand px-1.5 py-0.5 text-sm">profiles.is_admin = true</code>
          for your user in Supabase (see setup.md).
        </p>
        <Link href="/" className="mt-6 inline-block text-clay hover:underline">← Back to site</Link>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-6 py-6 md:grid-cols-[220px_1fr] md:gap-8 md:py-8">
      <aside className="md:sticky md:top-24 md:h-fit">
        <p className="eyebrow">Admin</p>
        <nav className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:gap-1 md:px-0 md:pb-0">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm hover:bg-sand md:rounded-lg md:border-0 md:bg-transparent md:gap-2.5 md:px-3 md:py-2.5"
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm text-ink-soft hover:bg-sand md:rounded-lg md:border-0 md:bg-transparent md:gap-2.5 md:px-3 md:py-2.5"
          >
            <Home size={16} /> View site
          </Link>
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
